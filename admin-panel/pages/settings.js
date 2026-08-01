import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role === 'admin') {
            router.replace('/profile?tab=settings');
        } else {
            router.replace('/profile');
        }
    }, [user, router]);

    return null;
}
