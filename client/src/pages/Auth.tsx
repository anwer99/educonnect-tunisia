import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BookOpen, Users, User, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Role selection page for first-time users
 */
export default function Auth() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const updateProfileMutation = trpc.profile.update.useMutation();

  useEffect(() => {
    // If already authenticated and has profile, redirect to dashboard
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleRoleSelection = async (role: "student" | "mentor" | "parent" | "school_admin") => {
    try {
      await updateProfileMutation.mutateAsync({
        userType: role,
        language: "fr", // Default to French for Tunisia
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Failed to set role:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">EduConnect Tunisia</CardTitle>
            <CardDescription>Plateforme de tutorat en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Connectez-vous pour commencer votre expérience d'apprentissage
            </p>
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <a href={getLoginUrl()}>Se connecter avec Manus</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600">
            Sélectionnez votre rôle pour continuer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Role */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-400">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-blue-600" />
                <CardTitle>Étudiant</CardTitle>
              </div>
              <CardDescription>
                Demandez de l'aide à des mentors qualifiés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6">
                Trouvez rapidement un tuteur pour vos matières, suivez vos progrès et gérez votre wallet EduCoin.
              </p>
              <Button
                onClick={() => handleRoleSelection("student")}
                disabled={updateProfileMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {updateProfileMutation.isPending ? "Chargement..." : "Continuer en tant qu'Étudiant"}
              </Button>
            </CardContent>
          </Card>

          {/* Mentor Role */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-400">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8 text-green-600" />
                <CardTitle>Mentor</CardTitle>
              </div>
              <CardDescription>
                Aidez les étudiants et gagnez des EduCoins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6">
                Acceptez les demandes d'aide, menez des sessions de tutorat et convertissez vos gains en TND.
              </p>
              <Button
                onClick={() => handleRoleSelection("mentor")}
                disabled={updateProfileMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {updateProfileMutation.isPending ? "Chargement..." : "Continuer en tant que Mentor"}
              </Button>
            </CardContent>
          </Card>

          {/* Parent Role */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-400">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-purple-600" />
                <CardTitle>Parent</CardTitle>
              </div>
              <CardDescription>
                Suivez les progrès de vos enfants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6">
                Consultez les notes des enseignants, suivez les sessions de tutorat et communiquez avec les mentors.
              </p>
              <Button
                onClick={() => handleRoleSelection("parent")}
                disabled={updateProfileMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {updateProfileMutation.isPending ? "Chargement..." : "Continuer en tant que Parent"}
              </Button>
            </CardContent>
          </Card>

          {/* School Admin Role */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-400">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8 text-orange-600" />
                <CardTitle>Administrateur</CardTitle>
              </div>
              <CardDescription>
                Gérez votre établissement scolaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6">
                Gérez les utilisateurs, les classes, les sessions et les rapports de votre école.
              </p>
              <Button
                onClick={() => handleRoleSelection("school_admin")}
                disabled={updateProfileMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {updateProfileMutation.isPending ? "Chargement..." : "Continuer en tant qu'Admin"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Vous pouvez changer votre rôle plus tard dans les paramètres
          </p>
        </div>
      </div>
    </div>
  );
}
