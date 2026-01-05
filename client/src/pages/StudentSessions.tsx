import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Student Sessions Page - Track active and completed tutoring sessions
 */
export default function StudentSessions() {
  const { user } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");

  // TODO: Add query to fetch student sessions
  // For now, using mock data structure
  const mockSessions = [
    {
      id: 1,
      mentorName: "Ahmed Ben Ali",
      subject: "Mathématiques",
      status: "active",
      startTime: new Date(Date.now() - 15 * 60000),
      estimatedDuration: 60,
      costCoins: 10,
      mentorRating: 4.8,
    },
    {
      id: 2,
      mentorName: "Fatima Khaled",
      subject: "Physique",
      status: "completed",
      startTime: new Date(Date.now() - 2 * 3600000),
      duration: 45,
      costCoins: 10,
      mentorRating: 4.9,
      studentRating: null,
    },
    {
      id: 3,
      mentorName: "Mohamed Saïdi",
      subject: "Français",
      status: "completed",
      startTime: new Date(Date.now() - 24 * 3600000),
      duration: 30,
      costCoins: 10,
      mentorRating: 4.5,
      studentRating: 5,
    },
  ];

  const handleSubmitRating = async () => {
    if (!selectedSessionId) return;

    try {
      // TODO: Call mutation to submit rating
      toast.success("Évaluation soumise ! Merci pour votre feedback.");
      setShowRatingDialog(false);
      setRating("5");
      setFeedback("");
      setSelectedSessionId(null);
    } catch (error) {
      toast.error("Erreur lors de la soumission de l'évaluation");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            En cours
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terminée
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Annulée
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDuration = (minutes: number | undefined) => {
    const m = minutes || 0;
    if (m < 60) return `${m} min`;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Sessions</h1>
          <p className="text-gray-600 mt-2">
            Suivez vos sessions de tutorat actives et consultez votre historique
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Sessions actives</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Active Sessions Tab */}
          <TabsContent value="active" className="space-y-4">
            {mockSessions.filter((s) => s.status === "active").length > 0 ? (
              <div className="space-y-4">
                {mockSessions
                  .filter((s) => s.status === "active")
                  .map((session) => (
                    <Card key={session.id} className="border-2 border-green-200 bg-green-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {session.mentorName}
                              </h3>
                              {getStatusBadge(session.status)}
                            </div>
                            <p className="text-lg text-blue-600 font-medium">
                              {session.subject}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {session.costCoins}
                            </p>
                            <p className="text-xs text-gray-600">EduCoins</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Durée estimée</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDuration(session.estimatedDuration)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Mentor</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-semibold text-gray-900">
                                {session.mentorRating}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Heure de début</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {session.startTime.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Terminer session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    Aucune session active
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Demandez un tuteur pour commencer une session
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {mockSessions.filter((s) => s.status === "completed").length > 0 ? (
              <div className="space-y-4">
                {mockSessions
                  .filter((s) => s.status === "completed")
                  .map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {session.mentorName}
                              </h3>
                              {getStatusBadge(session.status)}
                            </div>
                            <p className="text-blue-600 font-medium">
                              {session.subject}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {session.costCoins}
                            </p>
                            <p className="text-xs text-gray-600">EduCoins</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Durée</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDuration(session.duration)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Mentor</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-semibold text-gray-900">
                                {session.mentorRating}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Votre évaluation</p>
                            {session.studentRating ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {session.studentRating}
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Non évaluée</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {session.startTime.toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        {!session.studentRating && (
                          <Dialog open={showRatingDialog && selectedSessionId === session.id} onOpenChange={setShowRatingDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setSelectedSessionId(session.id)}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Évaluer cette session
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Évaluer {session.mentorName}</DialogTitle>
                                <DialogDescription>
                                  Partagez votre feedback sur cette session de tutorat
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                                    Note (1-5 étoiles)
                                  </label>
                                  <Select value={rating} onValueChange={setRating}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">⭐ 1 - Très mauvais</SelectItem>
                                      <SelectItem value="2">⭐⭐ 2 - Mauvais</SelectItem>
                                      <SelectItem value="3">⭐⭐⭐ 3 - Moyen</SelectItem>
                                      <SelectItem value="4">⭐⭐⭐⭐ 4 - Bon</SelectItem>
                                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - Excellent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                                    Feedback (optionnel)
                                  </label>
                                  <Textarea
                                    placeholder="Partagez votre expérience..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="min-h-24"
                                  />
                                </div>
                                <Button
                                  onClick={handleSubmitRating}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  Soumettre l'évaluation
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    Aucune session complétée
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Vos sessions terminées apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessions complétées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {mockSessions.filter((s) => s.status === "completed").length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total dépensé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {mockSessions.reduce((sum, s) => sum + s.costCoins, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">EduCoins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Temps total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {formatDuration(
                  mockSessions.reduce(
                    (sum, s) => sum + (s.duration ?? s.estimatedDuration),
                    0
                  )
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
