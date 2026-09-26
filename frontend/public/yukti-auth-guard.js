(function () {
    try {
        var scriptTag = document.currentScript || (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        var allowedRolesStr = scriptTag ? scriptTag.getAttribute('data-allowed-roles') : '';
        var allowedRoles = allowedRolesStr ? allowedRolesStr.split(',').map(function (r) { return r.trim(); }) : [];

        var token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('yukti_token');

        if (!token) {
            console.warn('[YUKTI Auth Guard] No JWT token found in localStorage. Redirecting to login.');
            window.location.href = '/login';
            return;
        }

        // Parse JWT payload safely
        var parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('[YUKTI Auth Guard] Invalid JWT structure. Redirecting to login.');
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('yukti_token');
            window.location.href = '/login';
            return;
        }

        var base64Url = parts[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        var payload = JSON.parse(jsonPayload);

        // Check token expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.warn('[YUKTI Auth Guard] JWT token expired. Redirecting to login.');
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('yukti_token');
            window.location.href = '/login';
            return;
        }

        // Check role permission if allowedRoles specified
        var userRole = (payload.role || '').toLowerCase();
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            console.warn('[YUKTI Auth Guard] Access denied. Role "' + userRole + '" not in allowed roles: ' + allowedRolesStr);
            alert('Access Denied: You do not have permission to view this portal.');
            window.location.href = '/login';
            return;
        }

        // --- INJECT FETCH INTERCEPTOR FOR STATIC DASHBOARDS ---
        var originalFetch = window.fetch;
        window.fetch = function () {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[0] === 'string' && args[0].indexOf('/api/') === 0) {
                var baseUrl = localStorage.getItem('yukti_backend_url');
                if (baseUrl && baseUrl !== 'undefined' && baseUrl !== 'null') {
                    // Prepend the production/external base URL
                    args[0] = baseUrl + args[0];
                }
                // If baseUrl is not set (e.g., local dev), we leave '/api/...' alone 
                // so the Vite Proxy or backend itself can handle it correctly.
            }
            return originalFetch.apply(this, args);
        };
        // -----------------------------------------------------

    } catch (e) {
        console.error('[YUKTI Auth Guard] Auth verification error:', e);
        window.location.href = '/login';
    }
})();
