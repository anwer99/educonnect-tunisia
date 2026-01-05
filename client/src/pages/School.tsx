import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Plus,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface ProgressNote {
  id: number;
  studentName: string;
  studentId: number;
  date: Date;
  content: string;
  visibleToParent: boolean;
  subject: string;
  rating: "excellent" | "good" | "average" | "needs_improvement";
}

interface Student {
  id: number;
  name: string;
  avatar: string;
  class: string;
  email: string;
}

/**
 * School Dashboard - THE INSTITUTIONAL WORLD
 * Teacher notes and parent communication
 */
export default function School() {
  const [userRole, setUserRole] = useState<"teacher" | "parent">("teacher");
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Mohamed Saïdi",
      avatar: "MS",
      class: "3ème A",
      email: "mohamed.saidi@school.tn",
    },
    {
      id: 2,
      name: "Leila Ben Salah",
      avatar: "LB",
      class: "3ème A",
      email: "leila.bensalah@school.tn",
    },
    {
      id: 3,
      name: "Karim Mansouri",
      avatar: "KM",
      class: "3ème B",
      email: "karim.mansouri@school.tn",
    },
  ]);

  const [notes, setNotes] = useState<ProgressNote[]>([
    {
      id: 1,
      studentName: "Mohamed Saïdi",
      studentId: 1,
      date: new Date(Date.now() - 1 * 24 * 3600000),
      content:
        "Excellent travail en classe ! Mohamed a participé activement et a montré une bonne compréhension des concepts.",
      visibleToParent: true,
      subject: "Mathématiques",
      rating: "excellent",
    },
    {
      id: 2,
      studentName: "Leila Ben Salah",
      studentId: 2,
      date: new Date(Date.now() - 2 * 24 * 3600000),
      content:
        "Besoin de travailler les exercices de révision. Leila doit être plus attentive en classe.",
      visibleToParent: false,
      subject: "Physique",
      rating: "needs_improvement",
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteVisibility, setNewNoteVisibility] = useState(true);
  const [newNoteSubject, setNewNoteSubject] = useState("Mathématiques");
  const [newNoteRating, setNewNoteRating] = useState<
    "excellent" | "good" | "average" | "needs_improvement"
  >("good");

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

  const handleAddNote = () => {
    if (!selectedStudent) {
      toast.error("Veuillez sélectionner un étudiant");
      return;
    }

    if (!newNoteContent.trim()) {
      toast.error("Veuillez écrire une note");
      return;
    }

    const newNote: ProgressNote = {
      id: notes.length + 1,
      studentName: selectedStudent.name,
      studentId: selectedStudent.id,
      date: new Date(),
      content: newNoteContent,
      visibleToParent: newNoteVisibility,
      subject: newNoteSubject,
      rating: newNoteRating,
    };

    setNotes([newNote, ...notes]);
    setNewNoteContent("");
    setNewNoteVisibility(true);
    setNewNoteRating("good");

    toast.success(
      `Note ajoutée pour ${selectedStudent.name}${newNoteVisibility ? " (visible au parent)" : ""}`
    );
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "needs_improvement":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Bon";
      case "average":
        return "Moyen";
      case "needs_improvement":
        return "À améliorer";
      default:
        return rating;
    }
  };

  const studentNotes = selectedStudent
    ? notes.filter((n) => n.studentId === selectedStudent.id)
    : [];

  const parentNotes = notes.filter((n) => n.visibleToParent);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon École</h1>
            <p className="text-gray-600 mt-2">
              Gestion des notes et communication parent-enseignant
            </p>
          </div>

          {/* Role Selector */}
          <Select value={userRole} onValueChange={(v) => setUserRole(v as any)}>
            <SelectTrigger className="w-40 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacher">👨‍🏫 Enseignant</SelectItem>
              <SelectItem value="parent">👨‍👩‍👧 Parent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {userRole === "teacher" ? (
          // TEACHER VIEW
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Note Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Ajouter une note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Selector */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sélectionnez un étudiant
                    </label>
                    <Select
                      value={selectedStudent?.id.toString() || ""}
                      onValueChange={(id) => {
                        const student = students.find(
                          (s) => s.id === parseInt(id)
                        );
                        setSelectedStudent(student || null);
                      }}
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Choisir un étudiant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name} ({student.class})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Selector */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Matière
                    </label>
                    <Select value={newNoteSubject} onValueChange={setNewNoteSubject}>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Évaluation
                    </label>
                    <Select value={newNoteRating} onValueChange={(v) => setNewNoteRating(v as any)}>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                        <SelectItem value="good">⭐⭐⭐⭐ Bon</SelectItem>
                        <SelectItem value="average">⭐⭐⭐ Moyen</SelectItem>
                        <SelectItem value="needs_improvement">
                          ⭐⭐ À améliorer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note Content */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Remarque pédagogique
                    </label>
                    <Textarea
                      placeholder="Écrivez votre remarque..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="min-h-24 border-gray-200"
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {newNoteVisibility ? (
                      <Eye className="w-5 h-5 text-blue-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        Visible au parent
                      </p>
                      <p className="text-xs text-gray-600">
                        {newNoteVisibility
                          ? "Les parents verront cette note"
                          : "Seul l'étudiant et vous verrez cette note"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewNoteVisibility(!newNoteVisibility)}
                    >
                      {newNoteVisibility ? "Masquer" : "Afficher"}
                    </Button>
                  </div>

                  <Button
                    onClick={handleAddNote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter la note
                  </Button>
                </CardContent>
              </Card>

              {/* Student Notes History */}
              {selectedStudent && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Notes pour {selectedStudent.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentNotes.length > 0 ? (
                      studentNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {note.subject}
                                </span>
                                <Badge className={getRatingColor(note.rating)}>
                                  {getRatingLabel(note.rating)}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">
                                {note.date.toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            {note.visibleToParent && (
                              <Badge className="bg-green-100 text-green-800">
                                <Eye className="w-3 h-3 mr-1" />
                                Parent
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-800">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Aucune note pour cet étudiant
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Students List */}
            <div>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Mes étudiants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedStudent?.id === student.id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {student.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">{student.class}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // PARENT VIEW
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Suivi académique de votre enfant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {parentNotes.length > 0 ? (
                  <div className="space-y-4">
                    {/* Timeline */}
                    <div className="relative">
                      {parentNotes.map((note, idx) => (
                        <div key={note.id} className="flex gap-4 mb-6">
                          {/* Timeline Line */}
                          {idx < parentNotes.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-12 bg-gradient-to-b from-blue-400 to-blue-200" />
                          )}

                          {/* Timeline Dot */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                              <BookOpen className="w-6 h-6" />
                            </div>
                          </div>

                          {/* Note Card */}
                          <div className="flex-1 pt-1">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {note.studentName} - {note.subject}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {note.date.toLocaleDateString("fr-FR", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                <Badge className={getRatingColor(note.rating)}>
                                  {getRatingLabel(note.rating)}
                                </Badge>
                              </div>
                              <p className="text-gray-800 text-sm leading-relaxed">
                                {note.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Aucune note visible pour le moment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Notes reçues", value: parentNotes.length, icon: "📝" },
                {
                  label: "Évaluations excellentes",
                  value: parentNotes.filter((n) => n.rating === "excellent")
                    .length,
                  icon: "⭐",
                },
                {
                  label: "Matières suivies",
                  value: new Set(parentNotes.map((n) => n.subject)).size,
                  icon: "📚",
                },
              ].map((stat, idx) => (
                <Card key={idx} className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl mb-2">{stat.icon}</p>
                    <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
