import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Copy, Wallet } from "lucide-react";

interface CustomerRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}

export function CustomerRegisterDialog({
  open,
  onOpenChange,
  onSuccess,
  onSwitchToLogin,
}: CustomerRegisterDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (data.seedPhrase) {
        setSeedPhrase(data.seedPhrase);
        setWalletAddress(data.walletAddress);
      } else {
        onSuccess();
        setName("");
        setEmail("");
        setPassword("");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate();
  };

  const handleCopySeedPhrase = () => {
    if (seedPhrase) {
      navigator.clipboard.writeText(seedPhrase);
      toast({
        title: "Copied!",
        description: "Seed phrase copied to clipboard. Store it securely!",
      });
    }
  };

  const handleSeedPhraseSaved = () => {
    setSeedPhrase(null);
    setWalletAddress(null);
    setName("");
    setEmail("");
    setPassword("");
    onSuccess();
  };

  // Show seed phrase after successful registration
  if (seedPhrase) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Your Ripple Wallet
            </DialogTitle>
            <DialogDescription>
              A Ripple (XRP) wallet has been created for you. Save your seed phrase — it&apos;s the only way to recover your wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {walletAddress && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                <p className="font-mono text-sm break-all bg-muted p-2 rounded">{walletAddress}</p>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Seed Phrase (24 words)</Label>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="font-mono text-sm break-all leading-relaxed">{seedPhrase}</p>
              </div>
              <p className="text-xs text-destructive font-medium mt-1">
                ⚠️ Write this down and store it securely. This will NOT be shown again.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopySeedPhrase}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Seed Phrase
              </Button>
              <Button
                className="flex-1"
                onClick={handleSeedPhraseSaved}
              >
                I&apos;ve Saved It
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Sign up to start shopping and collecting NFTs. A Ripple wallet will be created for you automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account
            </Button>

            {onSwitchToLogin && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSwitchToLogin}
                disabled={registerMutation.isPending}
              >
                Already have an account? Sign in
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
