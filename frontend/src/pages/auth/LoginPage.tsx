import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, type LoginInput } from '../../lib/validators';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.token);
      const isAdmin = ['admin', 'super-admin'].includes(res.data.user.role.nom);
      navigate(isAdmin ? '/admin' : '/app/conversations');
    } catch {
      setError('root', { message: 'Email ou mot de passe incorrect' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CiviBot</h1>
          <p className="text-gray-500 mt-1">Connectez-vous à votre compte</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input {...register('password')} type="password" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 text-white rounded-lg py-2 font-medium hover:bg-orange-700 disabled:opacity-50">
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Pas de compte ? <Link to="/register" className="text-orange-600 hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
