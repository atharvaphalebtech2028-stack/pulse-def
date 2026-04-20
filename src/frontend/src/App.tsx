import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  ChevronDown,
  Copy,
  Home,
  Info,
  Lock,
  LogOut,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PORTFOLIO = [
  { token: "ETH", balance: 1.245, price: 2285.4, icon: "⟠", color: "#627EEA" },
  { token: "BTC", balance: 0.0821, price: 48021, icon: "₿", color: "#F7931A" },
  { token: "USDT", balance: 1250, price: 1.0, icon: "₮", color: "#26A17B" },
];

const MARKETS = [
  {
    token: "ETH",
    name: "Ethereum",
    price: 2285.4,
    change: 4.2,
    points: [42, 45, 43, 47, 50, 48, 52, 55, 53, 58],
  },
  {
    token: "BTC",
    name: "Bitcoin",
    price: 48021,
    change: 1.8,
    points: [80, 82, 81, 85, 84, 87, 86, 90, 88, 92],
  },
  {
    token: "BNB",
    name: "BNB Chain",
    price: 312.5,
    change: -0.9,
    points: [60, 58, 62, 59, 57, 60, 56, 54, 58, 55],
  },
  {
    token: "SOL",
    name: "Solana",
    price: 98.2,
    change: 8.4,
    points: [30, 35, 33, 40, 38, 45, 43, 50, 48, 55],
  },
  {
    token: "MATIC",
    name: "Polygon",
    price: 0.85,
    change: 2.1,
    points: [20, 22, 21, 24, 23, 25, 24, 27, 26, 28],
  },
  {
    token: "AVAX",
    name: "Avalanche",
    price: 35.6,
    change: -1.3,
    points: [50, 48, 52, 49, 47, 50, 46, 44, 48, 45],
  },
];

const TRANSACTIONS = [
  {
    type: "Swap",
    amount: "0.5",
    token: "ETH → USDT",
    time: "2m ago",
    direction: "swap",
  },
  {
    type: "Receive",
    amount: "+0.0821",
    token: "BTC",
    time: "1h ago",
    direction: "in",
  },
  {
    type: "Send",
    amount: "-250",
    token: "USDT",
    time: "3h ago",
    direction: "out",
  },
  {
    type: "Stake",
    amount: "0.5",
    token: "ETH",
    time: "1d ago",
    direction: "stake",
  },
  {
    type: "Swap",
    amount: "100",
    token: "USDT → BNB",
    time: "2d ago",
    direction: "swap",
  },
];

const STAKING_POOLS = [
  {
    id: 1,
    name: "ETH-USDT LP",
    apy: 24.5,
    totalStaked: "$4.2M",
    userStaked: "$128.50",
    token: "ETH",
  },
  {
    id: 2,
    name: "BTC Vault",
    apy: 18.2,
    totalStaked: "$8.7M",
    userStaked: "$0.00",
    token: "BTC",
  },
  {
    id: 3,
    name: "PULSE Governance",
    apy: 45.8,
    totalStaked: "$1.1M",
    userStaked: "$54.20",
    token: "PULSE",
  },
];

const WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9E3d9f7b2e1a4";

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  ETH: { BTC: 0.0476, USDT: 2285.4, BNB: 7.31 },
  BTC: { ETH: 21.0, USDT: 48021, BNB: 153.6 },
  USDT: { ETH: 0.000437, BTC: 0.0000208, BNB: 0.0032 },
  BNB: { ETH: 0.137, BTC: 0.00651, USDT: 312.5 },
};

const TOKENS = ["ETH", "BTC", "USDT", "BNB"];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({
  points,
  positive,
}: { points: number[]; positive: boolean }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  });
  const color = positive ? "oklch(0.85 0.22 150)" : "oklch(0.65 0.22 25)";
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-label={positive ? "Uptrend chart" : "Downtrend chart"}
      role="img"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const totalValue = PORTFOLIO.reduce((acc, t) => acc + t.balance * t.price, 0);

  const txIcon = (dir: string) => {
    if (dir === "in") return <ArrowDownLeft className="w-4 h-4 text-primary" />;
    if (dir === "out")
      return <ArrowUpRight className="w-4 h-4 text-destructive" />;
    if (dir === "stake") return <Lock className="w-4 h-4 text-secondary" />;
    return <RefreshCw className="w-4 h-4 text-accent" />;
  };

  return (
    <div data-ocid="home.page" className="flex flex-col gap-5 px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="pulse-dot w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-lg font-bold tracking-widest text-foreground uppercase">
            PULSE DeFi
          </span>
        </div>
        <button type="button" className="relative p-2 rounded-xl glass-card">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
      </div>

      {/* Portfolio Value */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, oklch(0.85 0.22 150), transparent 60%)",
          }}
        />
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Total Portfolio
        </p>
        <p className="text-4xl font-bold font-mono-num portfolio-value-glow">
          $
          {totalValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            +3.24% (24h)
          </Badge>
          <span className="text-xs text-muted-foreground">+$242.80 today</span>
        </div>
      </div>

      {/* Token Cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Holdings
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {PORTFOLIO.map((t) => (
            <div
              key={t.token}
              className="glass-card rounded-xl p-4 min-w-[130px] flex-shrink-0"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm font-semibold">{t.token}</span>
              </div>
              <p className="text-base font-bold font-mono-num">{t.balance}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                $
                {(t.balance * t.price).toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Swap",
              ocid: "home.swap_button",
              color: "primary",
              onClick: () => {
                toast.info("Swap initiated");
                onNavigate("swap");
              },
            },
            {
              label: "Stake",
              ocid: "home.stake_button",
              color: "secondary",
              onClick: () => {
                toast.info("Opening stake dialog...");
                onNavigate("earn");
              },
            },
            {
              label: "Lend",
              ocid: "home.lend_button",
              color: "accent",
              onClick: () => toast.info("Lend feature coming soon"),
            },
            {
              label: "Borrow",
              ocid: "home.borrow_button",
              color: "destructive",
              onClick: () => toast.info("Borrow feature coming soon"),
            },
          ].map(({ label, ocid, color, onClick }) => (
            <button
              type="button"
              key={label}
              data-ocid={ocid}
              onClick={onClick}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl glass-card transition-all active:scale-95",
                color === "primary" &&
                  "border-primary/30 hover:border-primary/60",
                color === "secondary" &&
                  "border-secondary/30 hover:border-secondary/60",
                color === "accent" && "border-accent/30 hover:border-accent/60",
                color === "destructive" &&
                  "border-destructive/30 hover:border-destructive/60",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold",
                  color === "primary" && "text-primary",
                  color === "secondary" && "text-secondary",
                  color === "accent" && "text-accent",
                  color === "destructive" && "text-destructive",
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Recent Activity
        </p>
        <div className="flex flex-col gap-2">
          {TRANSACTIONS.slice(0, 4).map((tx, i) => (
            <div
              key={`${tx.type}-${tx.time}-${i}`}
              className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {txIcon(tx.direction)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{tx.token}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono-num font-semibold">
                  {tx.amount}
                </p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Markets Screen ───────────────────────────────────────────────────────────

function MarketsScreen() {
  const [search, setSearch] = useState("");
  const filtered = MARKETS.filter(
    (m) =>
      m.token.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      data-ocid="markets.page"
      className="flex flex-col gap-4 px-4 pt-4 pb-2"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Markets</h1>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          Live
        </Badge>
      </div>

      <div className="relative">
        <Input
          data-ocid="markets.search_input"
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-muted border-border pl-4 pr-4 h-10 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((m, i) => (
          <div
            key={m.token}
            data-ocid={`markets.item.${i + 1}`}
            className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                {m.token.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold">{m.token}</p>
                <p className="text-xs text-muted-foreground">{m.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkline points={m.points} positive={m.change >= 0} />
              <div className="text-right min-w-[70px]">
                <p className="text-sm font-mono-num font-semibold">
                  $
                  {m.price >= 1000
                    ? m.price.toLocaleString()
                    : m.price.toFixed(2)}
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold flex items-center justify-end gap-0.5",
                    m.change >= 0 ? "positive" : "negative",
                  )}
                >
                  {m.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {m.change >= 0 ? "+" : ""}
                  {m.change}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Swap Screen ──────────────────────────────────────────────────────────────

function SwapScreen() {
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDT");
  const [fromAmount, setFromAmount] = useState("1.0");

  const getRate = () => {
    if (fromToken === toToken) return 1;
    return EXCHANGE_RATES[fromToken]?.[toToken] ?? 0;
  };

  const toAmount = (Number.parseFloat(fromAmount) || 0) * getRate();

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleConfirmSwap = () => {
    toast.success("Swap submitted! Awaiting confirmation...", {
      description: `${fromAmount} ${fromToken} → ${toAmount.toFixed(6)} ${toToken}`,
    });
  };

  return (
    <div data-ocid="swap.page" className="flex flex-col gap-4 px-4 pt-4 pb-2">
      <h1 className="text-xl font-bold">Swap Tokens</h1>

      {/* From */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">
          You Pay
        </p>
        <div className="flex items-center gap-3">
          <Select value={fromToken} onValueChange={setFromToken}>
            <SelectTrigger
              data-ocid="swap.from_select"
              className="w-[110px] bg-muted border-border h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOKENS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            data-ocid="swap.amount_input"
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-1 bg-muted border-border h-11 text-right text-lg font-mono-num font-bold"
            placeholder="0.0"
          />
        </div>
      </div>

      {/* Swap direction button */}
      <div className="flex justify-center">
        <button
          type="button"
          data-ocid="swap.direction_button"
          onClick={handleSwapDirection}
          className="w-10 h-10 rounded-full glass-card border-primary/30 flex items-center justify-center hover:border-primary/60 transition-all active:rotate-180 duration-300"
        >
          <ArrowLeftRight className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* To */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">
          You Receive
        </p>
        <div className="flex items-center gap-3">
          <Select value={toToken} onValueChange={setToToken}>
            <SelectTrigger
              data-ocid="swap.to_select"
              className="w-[110px] bg-muted border-border h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOKENS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1 h-11 bg-muted border border-border rounded-lg flex items-center justify-end px-3">
            <span className="text-lg font-mono-num font-bold text-primary">
              {toAmount > 0 ? toAmount.toFixed(6) : "0.000000"}
            </span>
          </div>
        </div>
      </div>

      {/* Rate info */}
      <div className="glass-card rounded-xl p-3 flex flex-col gap-2">
        {[
          {
            label: "Exchange Rate",
            value: `1 ${fromToken} = ${getRate().toLocaleString()} ${toToken}`,
          },
          { label: "Est. Gas Fee", value: "~$2.84" },
          { label: "Price Impact", value: "<0.01%" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              {label}
            </span>
            <span className="text-xs font-mono-num font-semibold">{value}</span>
          </div>
        ))}
      </div>

      <Button
        data-ocid="swap.confirm_button"
        onClick={handleConfirmSwap}
        className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 font-semibold text-base shadow-neon-green"
      >
        Confirm Swap
      </Button>
    </div>
  );
}

// ─── Earn Screen ──────────────────────────────────────────────────────────────

function EarnScreen() {
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<
    (typeof STAKING_POOLS)[0] | null
  >(null);
  const [stakeAmount, setStakeAmount] = useState("");

  const openStake = (pool: (typeof STAKING_POOLS)[0]) => {
    setSelectedPool(pool);
    setStakeAmount("");
    setStakeDialogOpen(true);
    toast.info("Opening stake dialog...");
  };

  const confirmStake = () => {
    setStakeDialogOpen(false);
    toast.success("Staking confirmed! Rewards accumulating...", {
      description: `${stakeAmount || "0"} ${selectedPool?.token} staked in ${selectedPool?.name}`,
    });
  };

  return (
    <div data-ocid="earn.page" className="flex flex-col gap-4 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Earn</h1>
        <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
          Staking Pools
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {STAKING_POOLS.map((pool, i) => (
          <div
            key={pool.id}
            data-ocid={`earn.item.${i + 1}`}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold">{pool.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total staked: {pool.totalStaked}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">APY</p>
                <p className="text-2xl font-bold font-mono-num text-primary neon-glow">
                  {pool.apy}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Your Staked</p>
                <p className="text-sm font-mono-num font-semibold">
                  {pool.userStaked}
                </p>
              </div>
              <Button
                data-ocid={`earn.stake_button.${i + 1}`}
                onClick={() => openStake(pool)}
                size="sm"
                className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 h-8 px-4 text-xs font-semibold"
              >
                Stake
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Stake Dialog */}
      <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
        <DialogContent
          data-ocid="earn.dialog"
          className="bg-popover border-border max-w-[340px] rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Stake in {selectedPool?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="glass-card rounded-xl p-3 flex justify-between">
              <span className="text-xs text-muted-foreground">APY</span>
              <span className="text-sm font-mono-num font-bold text-primary">
                {selectedPool?.apy}%
              </span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Amount ({selectedPool?.token})
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-muted border-border h-11 font-mono-num"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="earn.confirm_button"
                onClick={confirmStake}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 shadow-neon-green"
              >
                Confirm Stake
              </Button>
              <Button
                variant="outline"
                onClick={() => setStakeDialogOpen(false)}
                className="flex-1 border-border"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Profile Screen (Wallet + Profile sub-tabs) ───────────────────────────────

function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [network, setNetwork] = useState("ethereum");
  const [copied, setCopied] = useState(false);

  const truncateAddr = (addr: string) =>
    `${addr.slice(0, 8)}...${addr.slice(-6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Address copied!");
  };

  const handleDisconnect = () => {
    toast.info("Wallet disconnected");
  };

  const handleSave = () => {
    toast.success("Settings saved!");
  };

  const txIcon = (dir: string) => {
    if (dir === "in") return <ArrowDownLeft className="w-3.5 h-3.5" />;
    if (dir === "out") return <ArrowUpRight className="w-3.5 h-3.5" />;
    if (dir === "stake") return <Lock className="w-3.5 h-3.5" />;
    return <RefreshCw className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-2">
      <Tabs defaultValue="wallet">
        <TabsList className="w-full bg-muted border border-border h-10">
          <TabsTrigger
            value="wallet"
            data-ocid="wallet.page"
            className="flex-1 text-xs font-semibold"
          >
            Wallet
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            data-ocid="profile.page"
            className="flex-1 text-xs font-semibold"
          >
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="flex flex-col gap-4 mt-4">
          {/* Connected Wallet */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-sm font-bold">0x</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  Connected Wallet
                </p>
                <p className="text-sm font-mono-num font-semibold truncate">
                  {truncateAddr(WALLET_ADDRESS)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="wallet.copy_button"
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-border gap-1.5"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                data-ocid="wallet.disconnect_button"
                onClick={handleDisconnect}
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <LogOut className="w-3 h-3" />
                Disconnect
              </Button>
            </div>
          </div>

          {/* Balance Overview */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Balances
            </p>
            <div className="flex flex-col gap-2">
              {PORTFOLIO.map((t) => (
                <div
                  key={t.token}
                  className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-sm font-semibold">{t.token}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono-num font-bold">
                      {t.balance}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      $
                      {(t.balance * t.price).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              History
            </p>
            <div className="flex flex-col gap-2">
              {TRANSACTIONS.map((tx, i) => (
                <div
                  key={`wallet-${tx.type}-${tx.time}`}
                  data-ocid={`wallet.item.${i + 1}`}
                  className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs",
                        tx.direction === "in"
                          ? "bg-primary/10 text-primary"
                          : tx.direction === "out"
                            ? "bg-destructive/10 text-destructive"
                            : tx.direction === "stake"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-accent/10 text-accent",
                      )}
                    >
                      {txIcon(tx.direction)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.token}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono-num font-semibold">
                      {tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="flex flex-col gap-4 mt-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-neon-green">
              <span className="text-xl font-bold text-primary">PD</span>
            </div>
            <div className="text-center">
              <p className="font-semibold">Pulse User</p>
              <p className="text-xs text-muted-foreground font-mono-num">
                {truncateAddr(WALLET_ADDRESS)}
              </p>
            </div>
          </div>

          {/* Network */}
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Network
            </p>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger
                data-ocid="profile.network_select"
                className="bg-muted border-border h-11"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "ethereum", label: "Ethereum" },
                  { value: "polygon", label: "Polygon" },
                  { value: "arbitrum", label: "Arbitrum" },
                  { value: "optimism", label: "Optimism" },
                  { value: "base", label: "Base" },
                ].map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Settings */}
          <div className="glass-card rounded-xl p-4 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Settings
            </p>
            {[
              {
                label: "Dark Mode",
                sublabel: "Always enabled",
                checked: true,
                disabled: true,
                ocid: "",
              },
              {
                label: "Notifications",
                sublabel: "Price alerts & updates",
                checked: notifications,
                disabled: false,
                ocid: "profile.notifications_switch",
                onChange: setNotifications,
              },
              {
                label: "Analytics",
                sublabel: "Usage analytics",
                checked: analytics,
                disabled: false,
                ocid: "profile.analytics_switch",
                onChange: setAnalytics,
              },
            ].map(({ label, sublabel, checked, disabled, ocid, onChange }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{sublabel}</p>
                </div>
                <Switch
                  data-ocid={ocid || undefined}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={onChange}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </div>

          <Button
            data-ocid="profile.save_button"
            onClick={handleSave}
            className="w-full h-11 bg-primary text-primary-foreground hover:opacity-90 font-semibold shadow-neon-green"
          >
            Save Settings
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────

const NAV_TABS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "markets", label: "Markets", Icon: BarChart2 },
  { id: "swap", label: "Swap", Icon: ArrowLeftRight },
  { id: "earn", label: "Earn", Icon: Zap },
  { id: "profile", label: "Profile", Icon: User },
];

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigate={setActiveTab} />;
      case "markets":
        return <MarketsScreen />;
      case "swap":
        return <SwapScreen />;
      case "earn":
        return <EarnScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center">
      {/* Device Frame */}
      <div className="relative w-full max-w-[390px] min-h-screen bg-background flex flex-col shadow-2xl">
        {/* Background mesh */}
        <div
          className="pointer-events-none fixed inset-0 max-w-[390px]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 10%, oklch(0.85 0.22 150 / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, oklch(0.65 0.18 220 / 0.04) 0%, transparent 50%)",
          }}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-20">{renderScreen()}</div>

        {/* Bottom Tab Bar */}
        <div className="tab-bar fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] grid grid-cols-5 px-2 py-2 z-50">
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`${id}.tab`}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl transition-all active:scale-90"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === id ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold transition-colors",
                  activeTab === id ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {activeTab === id && (
                <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer (desktop only) */}
      <div className="hidden md:block fixed bottom-4 text-center w-full text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.012 265)",
            border: "1px solid oklch(0.85 0.22 150 / 0.2)",
            color: "oklch(0.95 0.01 265)",
          },
        }}
      />
    </div>
  );
}
