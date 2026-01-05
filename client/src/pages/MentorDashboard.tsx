import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

/**
 * Mentor Dashboard with Waiting Room
 */
export default function MentorDashboard() {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch open tutoring requests
  const openRequestsQuery = trpc.tutoring.getOpenRequests.useQuery({});
  
  // Mutations
  const acceptRequestMutation = trpc.tutoring.acceptRequest.useMutation();
  const rejectRequestMutation = trpc.tutoring.rejectRequest.useMutation();

  // Auto-refresh open requests every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      openRequestsQuery.refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [openRequestsQuery]);

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;

    try {
      await acceptRequestMutation.mutateAsync({
        requestId: selectedRequest,
      });
      toast.success("Demande acceptée! Session créée.");
      setShowAcceptDialog(false);
      setSelectedRequest(null);
      openRequestsQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'acceptation"
      );
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    try {
      await rejectRequestMutation.mutateAsync({
        requestId: selectedRequest,
      });
      toast.info("Demande refusée");
      setShowRejectDialog(false);
      setSelectedRequest(null);
      openRequestsQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du refus"
      );
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Urgent";
      case "medium":
        return "Normal";
      case "low":
        return "Pas urgent";
      default:
        return urgency;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Salle d'attente - Mentor
          </h1>
          <p className="text-gray-600 mt-2">
            Acceptez les demandes d'aide des étudiants et gagnez des EduCoins
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Demandes en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {openRequestsQuery.data?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Gains potentiels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {openRequestsQuery.data?.length || 0} × 10
              </div>
              <p className="text-xs text-gray-500 mt-1">EduCoins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taux de réponse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                --
              </div>
              <p className="text-xs text-gray-500 mt-1">À venir</p>
            </CardContent>
          </Card>
        </div>

        {/* Waiting Room */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes en attente</CardTitle>
            <CardDescription>
              Cliquez sur une demande pour l'accepter ou la refuser
            </CardDescription>
          </CardHeader>
          <CardContent>
            {openRequestsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : openRequestsQuery.data && openRequestsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {openRequestsQuery.data.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {request.subject}
                          </h3>
                          <Badge className={getUrgencyColor(request.urgency || "medium")}>
                            {getUrgencyLabel(request.urgency || "medium")}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Demandé il y a{" "}
                              {Math.round(
                                (Date.now() - new Date(request.requestedAt).getTime()) / 60000
                              )}{" "}
                              min
                            </span>
                          </div>
                          {request.maxBudgetCoins && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              Budget: {request.maxBudgetCoins} EduCoins
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setShowAcceptDialog(true);
                          }}
                          disabled={acceptRequestMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setShowRejectDialog(true);
                          }}
                          disabled={rejectRequestMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Aucune demande en attente
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Les demandes apparaîtront ici quand les étudiants en feront
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">📊 Comment ça marche?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>• Vous recevez une notification quand un étudiant demande de l'aide</p>
              <p>• Acceptez la demande pour créer une session</p>
              <p>• Vous gagnez 10 EduCoins par session</p>
              <p>• Convertissez vos gains en TND dans votre wallet</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm">💰 Conversion EduCoin</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>• 1 TND = 10 EduCoins</p>
              <p>• Chaque session acceptée = 10 EduCoins</p>
              <p>• Retirez vos gains via Stripe</p>
              <p>• Pas de frais de conversion</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accept Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Accepter cette demande?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous allez créer une session et gagner 10 EduCoins. L'étudiant sera notifié immédiatement.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptRequest}
              disabled={acceptRequestMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {acceptRequestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Acceptation...
                </>
              ) : (
                "Accepter"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Refuser cette demande?</AlertDialogTitle>
          <AlertDialogDescription>
            L'étudiant pourra demander à un autre mentor. Vous ne gagnerez pas d'EduCoins pour cette session.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectRequest}
              disabled={rejectRequestMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectRequestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refus...
                </>
              ) : (
                "Refuser"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
