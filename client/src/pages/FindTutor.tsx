import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Mentor {
  id: number;
  name: string;
  avatar: string;
  subject: string;
  rating: number;
  reviews: number;
  status: "online" | "offline";
  responseTime: string;
  hourlyRate: number;
  bio: string;
}

interface TutoringRequest {
  id: number;
  studentName: string;
  subject: string;
  status: "pending" | "accepted" | "rejected";
  mentorName?: string;
  createdAt: Date;
}

/**
 * Find Tutor Page - THE ON-DEMAND WORLD
 * Uber-style matching with mentor notifications
 */
export default function FindTutor() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: 1,
      name: "Fatima Khaled",
      avatar: "FK",
      subject: "Mathématiques",
      rating: 4.9,
      reviews: 127,
      status: "online",
      responseTime: "< 2 min",
      hourlyRate: 15,
      bio: "Spécialiste en algèbre et géométrie. 5 ans d'expérience.",
    },
    {
      id: 2,
      name: "Ahmed Ben Ali",
      avatar: "AB",
      subject: "Physique",
      rating: 4.7,
      reviews: 94,
      status: "online",
      responseTime: "< 5 min",
      hourlyRate: 12,
      bio: "Professeur de physique passionné. Explications claires.",
    },
    {
      id: 3,
      name: "Leila Mansouri",
      avatar: "LM",
      subject: "Français",
      rating: 4.8,
      reviews: 156,
      status: "offline",
      responseTime: "~ 30 min",
      hourlyRate: 10,
      bio: "Littérature et grammaire. Préparation examens.",
    },
  ]);

  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [showMentorNotification, setShowMentorNotification] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [currentRequest, setCurrentRequest] = useState<TutoringRequest | null>(
    null
  );

  const subjects = [
    "Mathématiques",
    "Physique",
    "Chimie",
    "Biologie",
    "Français",
    "Anglais",
    "Arabe",
    "Histoire",
  ];

  const filteredMentors = selectedSubject
    ? mentors.filter((m) => m.subject === selectedSubject)
    : mentors;

  const handleRequestTutor = (mentor: Mentor) => {
    const newRequest: TutoringRequest = {
      id: requests.length + 1,
      studentName: "Vous",
      subject: mentor.subject,
      status: "pending",
      createdAt: new Date(),
    };

    setRequests([...requests, newRequest]);
    setCurrentRequest(newRequest);
    setSelectedMentor(mentor);

    // Simulate mentor notification after 1 second
    setTimeout(() => {
      setShowMentorNotification(true);
    }, 1000);

    toast.success(`Demande envoyée à ${mentor.name}! ⏳`);
  };

  const handleMentorAccept = () => {
    if (currentRequest) {
      setRequests(
        requests.map((r) =>
          r.id === currentRequest.id
            ? { ...r, status: "accepted", mentorName: selectedMentor?.name }
            : r
        )
      );

      toast.success(
        `${selectedMentor?.name} a accepté votre demande! 🎉 Session démarrée.`
      );
      setShowMentorNotification(false);

      // Simulate transaction
      setTimeout(() => {
        toast.success("10 EduCoins débités de votre compte 💰");
      }, 1500);
    }
  };

  const handleMentorReject = () => {
    if (currentRequest) {
      setRequests(
        requests.map((r) =>
          r.id === currentRequest.id ? { ...r, status: "rejected" } : r
        )
      );

      toast.error(`${selectedMentor?.name} a refusé votre demande.`);
      setShowMentorNotification(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trouver un Tuteur</h1>
          <p className="text-gray-600 mt-2">
            Connectez-vous avec des mentors qualifiés en secondes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Selector */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Sélectionnez une matière</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Choisir une matière..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Available Mentors */}
            {selectedSubject && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Mentors disponibles en {selectedSubject}
                </h2>

                {filteredMentors.length > 0 ? (
                  filteredMentors.map((mentor) => (
                    <Card
                      key={mentor.id}
                      className="border-0 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Mentor Info */}
                          <div className="flex gap-4 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {mentor.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {mentor.name}
                                </h3>
                                <Badge
                                  className={
                                    mentor.status === "online"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full mr-1 ${
                                      mentor.status === "online"
                                        ? "bg-green-600"
                                        : "bg-gray-600"
                                    }`}
                                  />
                                  {mentor.status === "online"
                                    ? "En ligne"
                                    : "Hors ligne"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-semibold">
                                    {mentor.rating}
                                  </span>
                                  <span>({mentor.reviews} avis)</span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-700 mb-3">
                                {mentor.bio}
                              </p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Réponse: {mentor.responseTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-4 h-4 text-yellow-600" />
                                  {mentor.hourlyRate} EduCoins/h
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 justify-center md:w-32">
                            <Button
                              onClick={() => handleRequestTutor(mentor)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Demander
                            </Button>
                            <Button variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Aucun mentor disponible pour cette matière
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Recent Requests */}
            {requests.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Vos demandes récentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {request.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.createdAt.toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "pending" && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                        {request.status === "accepted" && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Acceptée
                          </Badge>
                        )}
                        {request.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Refusée
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - How It Works */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
              <CardHeader>
                <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { step: "1", title: "Sélectionnez", desc: "Choisissez une matière" },
                  {
                    step: "2",
                    title: "Demandez",
                    desc: "Cliquez sur un mentor",
                  },
                  {
                    step: "3",
                    title: "Attendez",
                    desc: "Le mentor répond en secondes",
                  },
                  {
                    step: "4",
                    title: "Apprenez",
                    desc: "Session commence immédiatement",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Temps de réponse moyen</p>
                  <p className="text-2xl font-bold text-blue-600">2 min 30s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mentors actifs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mentors.filter((m) => m.status === "online").length}/
                    {mentors.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mentor Notification Dialog */}
        <Dialog open={showMentorNotification} onOpenChange={setShowMentorNotification}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                📱 Notification Mentor
              </DialogTitle>
              <DialogDescription className="text-center">
                {selectedMentor?.name} a reçu votre demande
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Mentor Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  {selectedMentor?.avatar}
                </div>
                <h3 className="font-bold text-gray-900">{selectedMentor?.name}</h3>
                <p className="text-sm text-gray-600">{selectedMentor?.subject}</p>
              </div>

              {/* Waiting Message */}
              <div className="text-center">
                <div className="inline-block">
                  <div className="animate-pulse flex gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedMentor?.name} examine votre demande...
                </p>
              </div>

              {/* Mentor Response Buttons (Simulated) */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Réponse simulée du mentor :
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleMentorAccept}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Accepter
                  </Button>
                  <Button
                    onClick={handleMentorReject}
                    variant="outline"
                    className="flex-1"
                  >
                    ✗ Refuser
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
