import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  BookOpen,
  Users,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Wallet as WalletIcon,
} from "lucide-react";

/**
 * Landing page for EduConnect Tunisia
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduConnect</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/auth")}
                >
                  Mon Profil
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/wallet")}
                >
                  Wallet
                </Button>
              </>
            ) : (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={getLoginUrl()}>Se connecter</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Tutorat en temps réel pour la Tunisie 🇹🇳
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connectez-vous avec des mentors qualifiés, apprenez à votre rythme, et gagnez des EduCoins. La plateforme éducative qui comprend vos besoins.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setLocation("/request-tutor")}
                >
                  Demander un tuteur
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/mentor-dashboard")}
                >
                  Tableau de bord mentor
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  asChild
                >
                  <a href={getLoginUrl()}>
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <Button size="lg" variant="outline">
                  En savoir plus
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Comment ça marche ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Student */}
            <Card className="border-2 hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Étudiant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Demandez de l'aide par matière</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Trouvez un mentor en secondes</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Payez avec EduCoins</span>
                </div>
                <Button
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setLocation("/request-tutor")}
                >
                  Essayer
                </Button>
              </CardContent>
            </Card>

            {/* Mentor */}
            <Card className="border-2 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Mentor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Acceptez les demandes</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Gagnez 10 EduCoins/session</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Retirez en TND</span>
                </div>
                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => setLocation("/mentor-dashboard")}
                >
                  Salle d'attente
                </Button>
              </CardContent>
            </Card>

            {/* Parent */}
            <Card className="border-2 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Parent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Suivez les progrès</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Lisez les notes des profs</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Communiquez facilement</span>
                </div>
                <Button
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                  disabled
                >
                  Bientôt
                </Button>
              </CardContent>
            </Card>

            {/* Admin */}
            <Card className="border-2 hover:border-orange-400 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Gérez l'école</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Rapports détaillés</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-gray-700">Contrôle complet</span>
                </div>
                <Button
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                  disabled
                >
                  Bientôt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Fonctionnalités principales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Matching en temps réel
                </h3>
                <p className="text-gray-600">
                  Trouvez un mentor en secondes, pas en jours. Système Uber-style avec notifications instantanées.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <WalletIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  EduCoin Wallet
                </h3>
                <p className="text-gray-600">
                  1 TND = 10 EduCoins. Recharges faciles via Stripe, retraits instantanés.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <Star className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Système de notation
                </h3>
                <p className="text-gray-600">
                  Évaluez les mentors, construisez votre réputation, gagnez la confiance.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <Users className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Portail Parent-Enseignant
                </h3>
                <p className="text-gray-600">
                  Notes privées, communication directe, suivi des progrès en temps réel.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4">
              <TrendingUp className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Feed Social
                </h3>
                <p className="text-gray-600">
                  Partagez vos réalisations, inspirez d'autres étudiants, célébrez les succès.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-4">
              <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Optimisé pour la Tunisie
                </h3>
                <p className="text-gray-600">
                  Interface légère, consomme peu de data, fonctionne sur tous les appareils.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'étudiants et de mentors en Tunisie
          </p>
          {isAuthenticated ? (
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation("/auth")}
            >
              Aller au tableau de bord
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              asChild
            >
              <a href={getLoginUrl()}>
                Se connecter maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <span className="text-white font-bold">EduConnect</span>
              </div>
              <p className="text-sm">
                La plateforme de tutorat en temps réel pour la Tunisie
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarification</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Conditions</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 EduConnect Tunisia. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
