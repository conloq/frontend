import AuthLayout from '@/components/AuthLayout';
import SignupContent from '@/components/SignupContent';

export default function Signup() {
    return (
        <AuthLayout title="Criar conta">
            <SignupContent />
        </AuthLayout>
    );
}
