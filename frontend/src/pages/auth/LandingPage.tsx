import { Link } from 'react-router-dom';
import { MessageSquare, FileText, CheckSquare, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-2xl font-bold"><span className="text-orange-600">Civi</span><span className="text-green-600">Bot</span></span>
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">Connexion</Link>
            <Link to="/register" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Vos démarches administratives,<br />
          <span className="text-orange-600">simplifiées par l'IA</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          CiviBot vous accompagne dans toutes vos procédures d'état civil et de création d'entreprise en Côte d'Ivoire.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-8 py-3 bg-orange-600 text-white rounded-xl text-lg font-medium hover:bg-orange-700">
            Commencer gratuitement
          </Link>
          <Link to="/login" className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-xl text-lg font-medium hover:bg-orange-50">
            Se connecter
          </Link>
        </div>
      </section>

      {/* Domaines */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Deux domaines couverts</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow p-8 space-y-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="text-green-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">État civil</h3>
            <p className="text-gray-600">Naissance, mariage, décès, nationalité — toutes les procédures expliquées clairement.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Déclaration de naissance</li>
              <li>• Acte de mariage</li>
              <li>• Déclaration de décès</li>
              <li>• Certificat de nationalité</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 space-y-4">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <Shield className="text-orange-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Création d'entreprise</h3>
            <p className="text-gray-600">Lancez votre activité en toute confiance avec le bon statut juridique.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• SARL (Société à responsabilité limitée)</li>
              <li>• SA (Société anonyme)</li>
              <li>• EI (Entreprise individuelle)</li>
              <li>• Coopérative</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Tout ce dont vous avez besoin</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: <MessageSquare className="text-orange-600" size={24} />, title: 'IA conversationnelle', desc: "Posez vos questions en langage naturel, obtenez des réponses précises." },
              { icon: <CheckSquare className="text-green-600" size={24} />, title: 'Checklists personnalisées', desc: "Suivez l'avancement de vos démarches étape par étape." },
              { icon: <FileText className="text-purple-600" size={24} />, title: 'Analyse de documents', desc: "Uploadez vos documents PDF pour une analyse et un résumé automatique." },
            ].map((f, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="flex justify-center">{f.icon}</div>
                <h3 className="font-bold text-gray-900">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8">
        <p>© 2024 CiviBot — Assistant IA pour les citoyens ivoiriens</p>
      </footer>
    </div>
  );
}
