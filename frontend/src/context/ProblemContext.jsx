import React, { createContext, useContext, useState, useEffect } from 'react';

const ProblemContext = createContext();

export function useProblems() {
    return useContext(ProblemContext);
}

export function ProblemProvider({ children }) {
    const [problems, setProblems] = useState([]);
    const [myProblems, setMyProblems] = useState([]);

    const fetchLiveProblems = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('yukti_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch('/api/problems', { headers });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const formatted = data.map(p => ({
                        id: p.id ? p.id.substring(0, 8).toUpperCase() : 'YKT-100',
                        db_id: p.id,
                        title: p.title,
                        description: p.description,
                        location: p.location_text || 'Ranchi, Jharkhand',
                        domain: p.domain || 'General',
                        subdomain: p.subdomain || 'General',
                        population_affected: p.population_affected || '100+ Citizens',
                        populationAffected: p.population_affected || '100+ Citizens',
                        photo_url: p.photo_url,
                        video_url: p.video_url,
                        voice_url: p.voice_url,
                        document_url: p.document_url,
                        status: p.status === 'submitted' ? 'Under Review' : (p.status === 'verified' ? 'University Matched' : p.status || 'Submitted'),
                        submitterType: 'Citizen',
                        submittedBy: 'Citizen Representative',
                        submittedOn: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : 'Recently',
                        votes: typeof p.upvotes === 'number' ? p.upvotes : (p.votes || 0),
                        aiPriority: {
                            score: p.priority === 'critical' ? 95 : p.priority === 'high' ? 82 : 65,
                            level: p.priority ? (p.priority.charAt(0).toUpperCase() + p.priority.slice(1)) : 'High'
                        },
                        timeline: [
                            { stage: 'Reported', done: true, date: 'Done' },
                            { stage: 'AI Categorized', done: true, date: 'Auto' },
                            { stage: 'Officer Verified', done: p.status !== 'submitted', date: 'Verified' },
                            { stage: 'University Matched', done: p.status === 'matched' || p.status === 'in_progress', date: 'Active' },
                            { stage: 'Team Assigned', done: p.status === 'in_progress', date: 'Assigned' },
                            { stage: 'CSR Co-Funded', done: p.status === 'in_progress', date: 'Co-Funded' },
                            { stage: 'Field Deployed', done: p.status === 'completed', date: 'Completed' },
                        ],
                        timestamp: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
                    }));

                    setProblems(formatted);
                    setMyProblems(prev => {
                        const existingDbIds = new Set(formatted.map(f => f.db_id).filter(Boolean));
                        const existingIds = new Set(formatted.map(f => f.id));
                        const uniqueLocal = prev.filter(p => !existingIds.has(p.id) && !existingDbIds.has(p.db_id));
                        const combined = [...uniqueLocal, ...formatted];
                        try {
                            localStorage.setItem('yukti_my_problems', JSON.stringify(combined));
                        } catch(e) {}
                        return combined;
                    });
                }
            }
        } catch (err) {
            console.warn('Failed to fetch live problems:', err);
        }
    };

    useEffect(() => {
        try {
            const savedLocal = localStorage.getItem('yukti_my_problems');
            if (savedLocal) {
                // Sanitize old stale dummy data from local storage
                if (savedLocal.includes('unsplash') || savedLocal.includes('"votes":12')) {
                    localStorage.removeItem('yukti_my_problems');
                } else {
                    const parsed = JSON.parse(savedLocal);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMyProblems(parsed);
                        setProblems(parsed);
                    }
                }
            }
        } catch(e) {}
        fetchLiveProblems();
    }, []);

    const addProblem = (newProblemData) => {
        const newProblem = {
            id: newProblemData.id || `YUKTI-${Math.floor(9000 + Math.random() * 1000)}`,
            db_id: newProblemData.db_id,
            title: newProblemData.title,
            description: newProblemData.summary || newProblemData.description,
            location: newProblemData.location,
            domain: newProblemData.domains[0]?.domain || 'General',
            subdomain: newProblemData.domains[0]?.subdomain || 'General',
            population_affected: '100+ Citizens',
            populationAffected: '100+ Citizens',
            photo_url: newProblemData.photo_url,
            video_url: newProblemData.video_url,
            voice_url: newProblemData.voice_url,
            document_url: newProblemData.document_url,
            status: 'Submitted',
            submitterType: newProblemData.submitterType || 'Individual',
            submittedBy: 'You',
            submittedOn: 'Just now',
            votes: 0,
            aiPriority: { score: newProblemData.priority.score, level: newProblemData.priority.level },
            timeline: [
                { stage: 'Reported', done: true, date: 'Just now' },
                { stage: 'AI Categorized', done: true, date: 'Just now' },
                { stage: 'Officer Verified', done: false },
                { stage: 'University Matched', done: false },
                { stage: 'Team Assigned', done: false },
                { stage: 'CSR Co-Funded', done: false },
                { stage: 'Field Deployed', done: false },
            ],
            timestamp: Date.now(),
        };

        setProblems(prev => {
            const updated = [newProblem, ...prev];
            try { localStorage.setItem('yukti_my_problems', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });
        setMyProblems(prev => [newProblem, ...prev]);
    };

    const handleVote = async (id) => {
        let targetDbId = null;
        setProblems(prev => prev.map(p => {
            if (p.id === id || p.db_id === id) {
                targetDbId = p.db_id;
                return { ...p, votes: (p.votes || 0) + 1 };
            }
            return p;
        }));

        if (targetDbId) {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('yukti_token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                await fetch(`/api/problems/${targetDbId}/upvote`, {
                    method: 'POST',
                    headers
                });
            } catch (err) {
                console.warn("Failed to persist upvote to backend DB:", err);
            }
        }
    };

    return (
        <ProblemContext.Provider value={{ problems, myProblems, addProblem, handleVote, fetchLiveProblems }}>
            {children}
        </ProblemContext.Provider>
    );
}
