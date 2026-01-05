import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Wallet as WalletIcon, ArrowDown, ArrowUp, Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Wallet Component for EduCoin Management
 * Handles topups, withdrawals, and transaction history
 */
export default function Wallet() {
  const { user } = useAuth();
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  // Queries
  const walletQuery = trpc.wallet.getBalance.useQuery();

  // Mutations
  const createTopupMutation = trpc.payment.createTopupIntent.useMutation();
  const createWithdrawalMutation = trpc.payment.createWithdrawalIntent.useMutation();

  const handleTopup = async () => {
    if (!topupAmount || isNaN(Number(topupAmount))) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    try {
      const result = await createTopupMutation.mutateAsync({
        amountTnd: topupAmount,
      });

      toast.success(
        `Recharge de ${result.amountTnd} TND (${result.amountCoins} EduCoins) initiée`
      );
      setTopupAmount("");
      setShowTopupDialog(false);
      walletQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la recharge"
      );
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    const coins = parseInt(withdrawAmount);
    if (walletQuery.data && coins > walletQuery.data.balanceCoins) {
      toast.error("Solde insuffisant");
      return;
    }

    try {
      const result = await createWithdrawalMutation.mutateAsync({
        amountCoins: coins,
      });

      toast.success(
        `Retrait de ${result.amountCoins} EduCoins (${result.amountTnd} TND) initié`
      );
      setWithdrawAmount("");
      setShowWithdrawDialog(false);
      walletQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du retrait"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <WalletIcon className="w-8 h-8 text-purple-600" />
            Mon Wallet EduCoin
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos EduCoins et convertissez-les en TND
          </p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-lg">Solde Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-5xl font-bold">
                  {walletQuery.data?.balanceCoins || 0}
                </p>
                <p className="text-purple-100 mt-1">EduCoins</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {walletQuery.data?.balanceTnd.toFixed(3) || "0.000"}
                </p>
                <p className="text-purple-100">TND</p>
              </div>
            </div>
            <p className="text-xs text-purple-100 mt-4">
              1 TND = 10 EduCoins
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="topup">Recharger</TabsTrigger>
            <TabsTrigger value="withdraw">Retirer</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Earned */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total gagné
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {walletQuery.data?.totalEarned || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">EduCoins</p>
                    </div>
                    <ArrowUp className="w-8 h-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Spent */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total dépensé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {walletQuery.data?.totalSpent || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">EduCoins</p>
                    </div>
                    <ArrowDown className="w-8 h-8 text-red-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Dialog open={showTopupDialog} onOpenChange={setShowTopupDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Recharger
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Recharger mon wallet</DialogTitle>
                      <DialogDescription>
                        Entrez le montant en TND que vous souhaitez recharger
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="topup-amount">Montant (TND)</Label>
                        <Input
                          id="topup-amount"
                          type="number"
                          placeholder="Ex: 10.000"
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(e.target.value)}
                          step="0.001"
                          min="0"
                        />
                        {topupAmount && (
                          <p className="text-xs text-gray-600 mt-2">
                            Vous recevrez ≈{" "}
                            {(Number(topupAmount) * 10).toFixed(0)} EduCoins
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleTopup}
                        disabled={createTopupMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {createTopupMutation.isPending
                          ? "Traitement..."
                          : "Recharger via Stripe"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={!walletQuery.data || walletQuery.data.balanceCoins === 0}
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Retirer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Retirer mes gains</DialogTitle>
                      <DialogDescription>
                        Convertissez vos EduCoins en TND
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="withdraw-amount">Montant (EduCoins)</Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          placeholder="Ex: 100"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          min="0"
                          max={walletQuery.data?.balanceCoins || 0}
                        />
                        {withdrawAmount && (
                          <p className="text-xs text-gray-600 mt-2">
                            Vous recevrez ≈{" "}
                            {(Number(withdrawAmount) / 10).toFixed(3)} TND
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleWithdraw}
                        disabled={createWithdrawalMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {createWithdrawalMutation.isPending
                          ? "Traitement..."
                          : "Retirer via Stripe"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Topup Tab */}
          <TabsContent value="topup">
            <Card>
              <CardHeader>
                <CardTitle>Recharger mon wallet</CardTitle>
                <CardDescription>
                  Ajoutez des EduCoins à votre compte via Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="topup-input">Montant à recharger (TND)</Label>
                  <Input
                    id="topup-input"
                    type="number"
                    placeholder="Ex: 50.000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    step="0.001"
                    min="0"
                  />
                  {topupAmount && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Vous recevrez:</strong> {(Number(topupAmount) * 10).toFixed(0)} EduCoins
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Taux de conversion: 1 TND = 10 EduCoins
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleTopup}
                  disabled={createTopupMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {createTopupMutation.isPending
                    ? "Traitement..."
                    : "Recharger via Stripe"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Retirer mes gains</CardTitle>
                <CardDescription>
                  Convertissez vos EduCoins en TND et retirez-les
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Solde disponible:</strong> {walletQuery.data?.balanceCoins || 0} EduCoins
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Équivalent en TND:</strong> {walletQuery.data?.balanceTnd.toFixed(3) || "0.000"} TND
                  </p>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="withdraw-input">Montant à retirer (EduCoins)</Label>
                  <Input
                    id="withdraw-input"
                    type="number"
                    placeholder="Ex: 100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="0"
                    max={walletQuery.data?.balanceCoins || 0}
                  />
                  {withdrawAmount && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Vous recevrez:</strong> {(Number(withdrawAmount) / 10).toFixed(3)} TND
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Taux de conversion: 10 EduCoins = 1 TND
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={createWithdrawalMutation.isPending || !walletQuery.data || walletQuery.data.balanceCoins === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {createWithdrawalMutation.isPending
                    ? "Traitement..."
                    : "Retirer via Stripe"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
