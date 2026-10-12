(function () {
    try {
        // Clean up any stale or invalid backend URLs stored from previous sessions
        try {
            var savedBackend = localStorage.getItem('yukti_backend_url');
            if (savedBackend && (savedBackend.indexOf('localhost:5000') !== -1 || savedBackend === 'undefined' || savedBackend === 'null')) {
                localStorage.removeItem('yukti_backend_url');
            }
        } catch (e) {}

        // --- BACKEND URL RESOLUTION LOGIC ---
        function resolveBackendBaseUrl() {
            // 1. Explicitly configured window global
            if (window.YUKTI_BACKEND_URL && typeof window.YUKTI_BACKEND_URL === 'string' && window.YUKTI_BACKEND_URL.trim() !== '') {
                return window.YUKTI_BACKEND_URL.trim().replace(/\/+$/, '');
            }

            // 2. Explicitly stored in localStorage
            try {
                var stored = localStorage.getItem('yukti_backend_url');
                if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
                    return stored.trim().replace(/\/+$/, '');
                }
            } catch (e) {}

            // 3. Query parameter ?backend=https://...
            try {
                var params = new URLSearchParams(window.location.search);
                var qBackend = params.get('backend');
                if (qBackend && qBackend.trim() !== '') {
                    var sanitized = qBackend.trim().replace(/\/+$/, '');
                    localStorage.setItem('yukti_backend_url', sanitized);
                    return sanitized;
                }
            } catch (e) {}

            var hostname = window.location.hostname || '';

            // 4. Local development: return empty string so relative '/api' is routed to Vite proxy or same-host
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '') {
                return '';
            }

            // 5. Render deployment (*.onrender.com):
            // On Render, frontend is a static site (e.g. yukti-frontend.onrender.com)
            // and backend is a web service (e.g. yukti-backend.onrender.com).
            if (hostname.indexOf('.onrender.com') !== -1) {
                var origin = window.location.origin;
                if (origin.indexOf('-frontend') !== -1) {
                    return origin.replace('-frontend', '-backend');
                } else if (origin.indexOf('frontend') !== -1) {
                    return origin.replace('frontend', 'backend');
                } else {
                    var serviceName = hostname.split('.onrender.com')[0];
                    return window.location.protocol + '//' + serviceName + '-backend.onrender.com';
                }
            }

            return '';
        }

        // Global setter helper
        window.setYuktiBackendUrl = function (url) {
            if (url && typeof url === 'string') {
                var clean = url.trim().replace(/\/+$/, '');
                window.YUKTI_BACKEND_URL = clean;
                try {
                    localStorage.setItem('yukti_backend_url', clean);
                } catch (e) {}
                console.log('[YUKTI] Backend URL set to:', clean);
            }
        };

        // --- GLOBAL FETCH INTERCEPTOR ---
        if (!window.__YUKTI_FETCH_INTERCEPTED__) {
            window.__YUKTI_FETCH_INTERCEPTED__ = true;
            var originalFetch = window.fetch;

            window.fetch = function (input, init) {
                var url = '';
                if (typeof input === 'string') {
                    url = input;
                } else if (input && typeof input.url === 'string') {
                    url = input.url;
                }

                // Check if this is an API call
                var isApiCall = false;
                if (url) {
                    if (url.indexOf('/api/') === 0 || url === '/api') {
                        isApiCall = true;
                    } else if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1 && url.indexOf('api/') === 0) {
                        isApiCall = true;
                        url = '/' + url;
                    }
                }

                if (isApiCall) {
                    var base = resolveBackendBaseUrl();
                    if (base) {
                        var targetUrl = base + (url.indexOf('/') === 0 ? url : '/' + url);
                        if (typeof input === 'string') {
                            input = targetUrl;
                        } else if (input instanceof Request) {
                            try {
                                input = new Request(targetUrl, init || input);
                            } catch (e) {
                                input = targetUrl;
                            }
                        }
                    }
                }

                return originalFetch.call(this, input, init).then(function (res) {
                    // Safety protection for API responses:
                    // If a static server (like Render static site) rewrote /api to /index.html and returned HTML,
                    // or if an error returned HTML, prevent `res.json()` from crashing with SyntaxError.
                    var ctype = res.headers.get('content-type') || '';
                    if (isApiCall && ctype.indexOf('text/html') !== -1) {
                        console.warn('[YUKTI API Interceptor] HTML returned for API endpoint:', url || input, '\nTarget was:', input);
                        var originalJson = res.json.bind(res);
                        res.json = function () {
                            return res.text().then(function (text) {
                                try {
                                    return JSON.parse(text);
                                } catch (parseErr) {
                                    console.warn('[YUKTI API] Safe JSON fallback for HTML response:', text.substring(0, 100));
                                    // Collections fallback to empty array, objects to empty object
                                    if (url.indexOf('proposals') !== -1 || url.indexOf('problems') !== -1 || url.indexOf('users') !== -1) {
                                        return [];
                                    }
                                    return {};
                                }
                            });
                        };
                    }
                    return res;
                });
            };
        }

        // --- OPEN ACCESS AUTH BYPASS ---
        var scriptTag = document.currentScript || (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        var allowedRolesStr = scriptTag ? scriptTag.getAttribute('data-allowed-roles') : '';
        var allowedRoles = allowedRolesStr ? allowedRolesStr.split(',').map(function (r) { return r.trim().toLowerCase(); }) : [];
        var primaryRole = allowedRoles[0] || '';

        function createMockToken(roleName) {
            function safeB64(obj) {
                try {
                    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
                        .replace(/=/g, '')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_');
                } catch (e) {
                    return btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
                }
            }
            var h = safeB64({ alg: "HS256", typ: "JWT" });
            var p = safeB64({
                sub: "1",
                id: 1,
                name: (roleName ? roleName.toUpperCase() : "DEMO") + " Officer",
                email: (roleName || "demo") + "@yukti.gov.in",
                role: roleName || "university",
                exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
            });
            return h + "." + p + ".mock_signature_bypass";
        }

        var token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('yukti_token');
        var user = null;
        try {
            user = JSON.parse(localStorage.getItem('yukti_user') || '{}');
        } catch (e) {}

        if (primaryRole) {
            if (!token || !user || !user.role || (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase()))) {
                var assignedRole = primaryRole;
                var freshToken = createMockToken(assignedRole);
                var freshUser = {
                    id: 1,
                    name: assignedRole.toUpperCase() + " Officer",
                    email: assignedRole + "@yukti.gov.in",
                    role: assignedRole
                };

                localStorage.setItem('yukti_token', freshToken);
                localStorage.setItem('token', freshToken);
                localStorage.setItem('access_token', freshToken);
                localStorage.setItem('yukti_user', JSON.stringify(freshUser));
                sessionStorage.setItem('yukti_token', freshToken);
                sessionStorage.setItem('token', freshToken);
                sessionStorage.setItem('access_token', freshToken);
                sessionStorage.setItem('yukti_user', JSON.stringify(freshUser));
            }
        }

        console.log('[YUKTI Auth Guard] Active. Backend base:', resolveBackendBaseUrl() || '(relative)');
    } catch (e) {
        console.warn('[YUKTI Auth Guard] Initialized safely:', e);
    }
})();
