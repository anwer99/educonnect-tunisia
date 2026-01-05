import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useLocation } from "wouter";

const SUBJECTS = [
  "Mathématiques",
  "Physique",
  "Chimie",
  "Biologie",
  "Français",
  "Anglais",
  "Arabe",
  "Histoire",
  "Géographie",
  "Informatique",
  "Philosophie",
  "Économie",
];

const URGENCY_LEVELS = [
  { value: "low", label: "Basse (Pas urgent)" },
  { value: "medium", label: "Moyenne (Normal)" },
  { value: "high", label: "Haute (Urgent)" },
];

/**
 * Component for students to request a tutor
 */
export default function RequestTutor() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [maxBudget, setMaxBudget] = useState("");

  const createRequestMutation = trpc.tutoring.createRequest.useMutation();
  const getAvailableMentorsMutation = trpc.tutoring.getAvailableMentors.useQuery(
    { subject },
    { enabled: !!subject }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject) {
      toast.error("Veuillez sélectionner une matière");
      return;
    }

    if (!description.trim()) {
      toast.error("Veuillez décrire votre besoin");
      return;
    }

    try {
      const request = await createRequestMutation.mutateAsync({
        subject,
        description,
        urgency: urgency as "low" | "medium" | "high",
        maxBudgetCoins: maxBudget ? parseInt(maxBudget) : undefined,
      });

      toast.success("Demande créée! Les mentors disponibles sont notifiés.");
      
      // Reset form
      setSubject("");
      setDescription("");
      setUrgency("medium");
      setMaxBudget("");

      // Redirect to sessions page
      setTimeout(() => {
        setLocation("/sessions");
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la création de la demande"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demander un Tuteur</h1>
          <p className="text-gray-600 mt-2">
            Décrivez votre besoin et trouvez rapidement un mentor qualifié
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Créer une demande</CardTitle>
                <CardDescription>
                  Remplissez les détails de votre demande d'aide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Matière *</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Sélectionnez une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((subj) => (
                          <SelectItem key={subj} value={subj}>
                            {subj}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Décrivez votre besoin *</Label>
                    <Textarea
                      id="description"
                      placeholder="Ex: J'ai besoin d'aide pour comprendre les équations du second degré..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-32"
                    />
                    <p className="text-xs text-gray-500">
                      Soyez précis pour attirer les meilleurs mentors
                    </p>
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Niveau d'urgence</Label>
                    <Select value={urgency} onValueChange={setUrgency}>
                      <SelectTrigger id="urgency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {URGENCY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget maximum (EduCoins) - Optionnel</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Ex: 50"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      min="0"
                    />
                    <p className="text-xs text-gray-500">
                      1 TND = 10 EduCoins. Laissez vide pour pas de limite
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={createRequestMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {createRequestMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer la demande
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Available Mentors Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mentors disponibles</CardTitle>
                <CardDescription>
                  {subject ? `Pour ${subject}` : "Sélectionnez une matière"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!subject ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Sélectionnez une matière pour voir les mentors disponibles
                  </p>
                ) : getAvailableMentorsMutation.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                ) : getAvailableMentorsMutation.data && getAvailableMentorsMutation.data.length > 0 ? (
                  <div className="space-y-3">
                    {getAvailableMentorsMutation.data.map((mentor) => (
                      <div
                        key={mentor.userId}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <p className="font-medium text-sm text-gray-900">
                          Mentor #{mentor.userId}
                        </p>
                        {mentor.mentorBio && (
                          <p className="text-xs text-gray-600 mt-1">{mentor.mentorBio}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            En ligne
                          </span>
                          {mentor.mentorRating && (
                            <span className="text-xs text-yellow-600">
                              ⭐ {mentor.mentorRating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Aucun mentor disponible pour cette matière
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm">💡 Conseil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-700">
                  Soyez spécifique dans votre description pour attirer les meilleurs mentors et obtenir une aide plus rapide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
