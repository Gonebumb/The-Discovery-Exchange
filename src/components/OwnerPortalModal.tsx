import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  FolderLock,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { clearOwnerToken, getOwnerToken, setOwnerToken } from '../lib/ownerSession';
import { PrivateVaultPortal } from './PrivateVaultPortal';

interface TradeReceiptSummary {
  receiptId: string;
  itemTitle: string;
  totalCents: number;
  sellerCashCents: number;
  sellerEquityCents: number;
  buyerEquityCents: number;
  mode: string;
  executedAtUtc: string;
}

interface OwnerSession {
  ownerUuid: string;
  email: string;
  stateCode: string;
  votingWeight: number;
  accumulationBalanceUsd: number;
  sellerCashBalanceUsd?: number;
  dbcBalance: number;
  productionRealMoneyHold?: boolean;
  recentReceipts?: TradeReceiptSummary[];
}

type AuthViewMode = 'login' | 'register' | 'recover';
type RecoveryStep = 'email' | 'verify_identity' | 'reset';

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const OwnerPortalPage: React.FC = () => {
  const [mode, setMode] = useState<AuthViewMode>('login');

  // Sign-In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regConfirmEmail, setRegConfirmEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isAdultVerified, setIsAdultVerified] = useState(false);
  const [acceptedCharterV10, setAcceptedCharterV10] = useState(false);

  // Password Recovery fields
  const [recoverStep, setRecoverStep] = useState<RecoveryStep>('email');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverFullName, setRecoverFullName] = useState('');
  const [recoverStateCode, setRecoverStateCode] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [issuedRecoveryCode, setIssuedRecoveryCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback & Session State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [sessionOwner, setSessionOwner] = useState<OwnerSession | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);
  const [showVaultLogin, setShowVaultLogin] = useState(false);

  const switchMode = (nextMode: AuthViewMode) => {
    setMode(nextMode);
    setErrorMsg(null);
    setInfoMsg(null);
    if (nextMode === 'recover') {
      setRecoverStep('email');
      setIssuedRecoveryCode(null);
      setRecoveryCodeInput('');
      setNewPassword('');
      setConfirmNewPassword('');
      if (signInEmail.trim() && !recoverEmail.trim()) {
        setRecoverEmail(signInEmail.trim());
      }
    }
  };

  const loadWalletSession = useCallback(async (token: string) => {
    setIsRefreshingWallet(true);
    try {
      const walletRes = await fetch('/api/wallets/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (walletRes.ok) {
        const walletData = (await walletRes.json()) as OwnerSession;
        setSessionOwner(walletData);
        return;
      }
      if (walletRes.status === 401) {
        clearOwnerToken();
        setSessionOwner(null);
        return;
      }
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const ownerData = (await meRes.json()) as OwnerSession;
        setSessionOwner(ownerData);
      } else {
        clearOwnerToken();
      }
    } catch {
      // Ignore offline network errors on initial check
    } finally {
      setIsRefreshingWallet(false);
    }
  }, []);

  useEffect(() => {
    // Clear any legacy localStorage token left from earlier builds
    try {
      window.localStorage.removeItem('tdex_owner_token');
    } catch {
      // Ignore storage access issues
    }
    const token = getOwnerToken();
    if (!token) return;
    void loadWalletSession(token);
  }, [loadWalletSession]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = signInEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address (for example: name@example.com).');
      return;
    }
    if (!signInPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: signInPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid email or password.');
        return;
      }
      setOwnerToken(data.token);
      setSessionOwner(data.owner);
      setSignInPassword('');
      if (data.token) {
        void loadWalletSession(data.token);
      }
    } catch {
      setErrorMsg('Unable to reach the authentication server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedName = fullName.trim();
    const trimmedState = stateCode.trim().toUpperCase();
    const trimmedEmail = regEmail.trim().toLowerCase();
    const trimmedConfirmEmail = regConfirmEmail.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your Legal Full Name.');
      return;
    }
    if (trimmedState.length < 2) {
      setErrorMsg('Please enter your State or Country Code (for example: OH, TX, CA).');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid Email Address (for example: name@example.com).');
      return;
    }
    if (trimmedEmail !== trimmedConfirmEmail) {
      setErrorMsg('Your email addresses do not match. Please enter the exact same email twice.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Your passwords do not match. Please re-enter your password.');
      return;
    }
    if (!isAdultVerified) {
      setErrorMsg('Please check the Article 4.5 Age Verification box confirming you are 18 or older.');
      return;
    }
    if (!acceptedCharterV10) {
      setErrorMsg('Please check the box accepting The Discovery Exchange Constitution (Version 10.0).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          confirmEmail: trimmedConfirmEmail,
          password: regPassword,
          confirmPassword: regConfirmPassword,
          fullName: trimmedName,
          stateCode: trimmedState,
          isAdultVerified,
          acceptedCharterV10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Registration could not be completed.');
        return;
      }
      setOwnerToken(data.token);
      setSessionOwner(data.owner);
      setRegPassword('');
      setRegConfirmPassword('');
      if (data.ledgerReceipt) setReceiptId(data.ledgerReceipt);
      if (data.token) {
        void loadWalletSession(data.token);
      }
    } catch {
      setErrorMsg('Unable to reach the registration server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = recoverEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMsg('Please enter the valid email address linked to your Owner account.');
      return;
    }

    if (recoverStep === 'verify_identity') {
      if (recoverFullName.trim().length < 2 || recoverStateCode.trim().length < 2) {
        setErrorMsg('Please enter both your registered Legal Full Name and State/Country Code.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload =
        recoverStep === 'verify_identity'
          ? {
              email: trimmedEmail,
              fullName: recoverFullName.trim(),
              stateCode: recoverStateCode.trim().toUpperCase(),
            }
          : { email: trimmedEmail };

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not process your password recovery request.');
        return;
      }

      if (data.deliveryMode === 'identity_verification_required') {
        setRecoverStep('verify_identity');
        setInfoMsg(data.message);
        return;
      }

      if (data.deliveryMode === 'prelaunch_verified_code' && data.recoveryCode) {
        setIssuedRecoveryCode(String(data.recoveryCode));
        setRecoveryCodeInput(String(data.recoveryCode));
        setRecoverStep('reset');
        setInfoMsg(data.message);
        return;
      }

      setRecoverStep('reset');
      setInfoMsg(
        data.message ||
          'If an Owner account exists for that email, a recovery code has been sent. Enter it below.'
      );
    } catch {
      setErrorMsg('Unable to reach the password recovery service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = recoverEmail.trim().toLowerCase();
    if (!recoveryCodeInput.trim()) {
      setErrorMsg('Please enter your one-time recovery code.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Your new password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Your new passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          recoveryCode: recoveryCodeInput.trim(),
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Password reset failed.');
        return;
      }

      setSignInEmail(trimmedEmail);
      setSignInPassword('');
      setIssuedRecoveryCode(null);
      setRecoveryCodeInput('');
      setNewPassword('');
      setConfirmNewPassword('');
      setRecoverFullName('');
      setRecoverStateCode('');
      setRecoverStep('email');
      setMode('login');
      setInfoMsg(
        data.message || 'Your password has been updated! Sign in below with your new password.'
      );
    } catch {
      setErrorMsg('Unable to complete password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const token = getOwnerToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      clearOwnerToken();
    }
    setSessionOwner(null);
    setReceiptId(null);
    setMode('login');
    setInfoMsg('You have been signed out safely.');
  };

  const emailsMatch =
    regEmail.trim().length > 0 &&
    regConfirmEmail.trim().length > 0 &&
    regEmail.trim().toLowerCase() === regConfirmEmail.trim().toLowerCase();
  const emailsMismatch =
    regConfirmEmail.trim().length > 0 &&
    regEmail.trim().toLowerCase() !== regConfirmEmail.trim().toLowerCase();

  const passwordsMatch =
    regPassword.length >= 8 &&
    regConfirmPassword.length > 0 &&
    regPassword === regConfirmPassword;
  const passwordsMismatch =
    regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div className="space-y-6">
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
          Article 1.1 &amp; Article 4.1 &bull; Ownership-First Architecture (No Bosses, Only Owners)
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold">
          Owner Portal &amp; Kitchen-Table Center
        </h1>
        <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
          Sign in to your existing Owner account or register as a new verified Owner to access the{' '}
          <strong>One Owner, One Vote</strong> portal, sample 50/25/25 wallets, and append-only
          ledger (pre-launch walkthrough accounts carry zero live funds).
        </p>
      </div>

      {sessionOwner ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Walkthrough Session &bull; One Owner, One Vote</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#081d38]">
                {sessionOwner.email} ({sessionOwner.stateCode})
              </h2>
              <p className="text-xs font-mono text-slate-500">
                ID: {sessionOwner.ownerUuid} {receiptId ? `• Ledger Receipt: ${receiptId}` : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isRefreshingWallet}
                onClick={() => {
                  const token = getOwnerToken();
                  if (token) void loadWalletSession(token);
                }}
                className="px-3 py-2 bg-[#fbfaf7] hover:bg-amber-50 border border-slate-200 text-[#081d38] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWallet ? 'animate-spin' : ''}`} />
                <span>Refresh Wallet</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#081d38]" />
                <span>Constitutional Voting Power</span>
              </div>
              <div className="text-2xl font-mono font-bold text-[#081d38] mt-1">
                1 Owner = {sessionOwner.votingWeight} Vote
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Locked by Article 4.1</div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                <span>25% Property Accumulation</span>
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">
                ${sessionOwner.accumulationBalanceUsd.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Segregated Escrow (Article 10.1)</div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-700" />
                <span>50% Marketplace Cash Wallet</span>
              </div>
              <div className="text-2xl font-mono font-bold text-amber-800 mt-1">
                ${(sessionOwner.sellerCashBalanceUsd || 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Seller 50% Proceeds (Art. 12.1)</div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#081d38]" />
                <span>Discovery Brick Coins (DBC)</span>
              </div>
              <div className="text-2xl font-mono font-bold text-[#081d38] mt-1">
                {sessionOwner.dbcBalance.toLocaleString()} DBC
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Post-Deed Units (Article 11.2)</div>
            </div>
          </div>

          {sessionOwner.recentReceipts && sessionOwner.recentReceipts.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#081d38]">
                <Receipt className="w-4 h-4 text-[#dfa62a]" />
                <span>Recent Persisted 50/25/25 Trade Receipts</span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {sessionOwner.recentReceipts.map((rec) => (
                  <div
                    key={rec.receiptId}
                    className="p-3 bg-[#fbfaf7] flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#081d38] break-words">{rec.itemTitle}</div>
                      <div className="font-mono text-[11px] text-slate-500 break-all">
                        {rec.receiptId} &bull; {rec.mode} &bull;{' '}
                        {new Date(rec.executedAtUtc).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
                      <span className="text-slate-700 font-bold">
                        Total: ${(rec.totalCents / 100).toFixed(2)}
                      </span>
                      <span className="text-emerald-700">
                        Cash: ${(rec.sellerCashCents / 100).toFixed(2)}
                      </span>
                      <span className="text-amber-800">
                        Seller 25%: ${(rec.sellerEquityCents / 100).toFixed(2)}
                      </span>
                      <span className="text-sky-800">
                        Buyer 25%: ${(rec.buyerEquityCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-lg mx-auto space-y-5">
          {/* ============================================================== */}
          {/* VIEW 1: DEDICATED OWNER SIGN IN (CLEAN AMAZON-MEETS-TDEX CARD) */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <>
              <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <h2 className="font-serif text-2xl font-bold text-[#081d38]">Sign In</h2>
                  <p className="text-sm text-slate-600">
                    Already registered? Sign in with your Owner email and password.
                  </p>
                </div>

                {infoMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-sm text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{infoMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-sm text-red-900 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="tdex-signin-email"
                      className="block text-sm font-bold text-slate-800"
                    >
                      Email Address
                    </label>
                    <input
                      id="tdex-signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="tdex-signin-password"
                        className="block text-sm font-bold text-slate-800"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('recover')}
                        className="text-xs sm:text-sm font-bold text-[#0f4c81] hover:text-[#081d38] underline underline-offset-2 cursor-pointer"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="tdex-signin-password"
                        name="password"
                        type={showSignInPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-11 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword((prev) => !prev)}
                        aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-1"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#081d38] hover:bg-[#0f294d] disabled:opacity-60 text-[#dfa62a] text-base font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              </div>

              {/* Amazon-style clean separation between Sign In and Create Account */}
              <div className="space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-300" />
                  <span className="bg-[#fbfaf7] px-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                    New to The Discovery Exchange?
                  </span>
                  <div className="w-full border-t border-slate-300" />
                </div>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="w-full py-3 px-4 bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] border-2 border-[#081d38] text-sm sm:text-base font-bold rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Create Your Owner Account</span>
                </button>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: DEDICATED CREATE ACCOUNT (CONFIRM EMAIL + BIG BOXES)   */}
          {/* ============================================================== */}
          {mode === 'register' && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#081d38]">
                    Create Your Owner Account
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Become a verified Owner — $0 fee, One Owner, One Vote.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] hover:text-[#081d38] underline underline-offset-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-sm text-red-900 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="tdex-reg-fullname"
                    className="text-sm font-bold text-slate-800 inline-flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Legal Full Name</span>
                    <span className="text-xs font-normal text-slate-500">
                      (Encrypted in PII Vault Only)
                    </span>
                  </label>
                  <input
                    id="tdex-reg-fullname"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="First and last name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tdex-reg-state"
                    className="block text-sm font-bold text-slate-800"
                  >
                    State / Country Code{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (For Out-of-State Blind Jury Selection)
                    </span>
                  </label>
                  <input
                    id="tdex-reg-state"
                    name="stateCode"
                    type="text"
                    autoComplete="address-level1"
                    required
                    maxLength={10}
                    placeholder="e.g., OH, TX, CA"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl uppercase"
                  />
                </div>

                {/* Email entered TWICE to prevent typos */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="tdex-reg-email"
                    className="block text-sm font-bold text-slate-800"
                  >
                    Email Address
                  </label>
                  <input
                    id="tdex-reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tdex-reg-confirm-email"
                    className="block text-sm font-bold text-slate-800"
                  >
                    Re-enter Email Address{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (Confirm to make sure it is spelled correctly)
                    </span>
                  </label>
                  <input
                    id="tdex-reg-confirm-email"
                    name="confirmEmail"
                    type="email"
                    autoComplete="off"
                    required
                    placeholder="Type your email address a second time"
                    value={regConfirmEmail}
                    onChange={(e) => setRegConfirmEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border-2 focus:outline-none rounded-xl ${
                      emailsMismatch
                        ? 'border-red-500 focus:border-red-600'
                        : emailsMatch
                          ? 'border-emerald-600 focus:border-emerald-700'
                          : 'border-slate-300 focus:border-[#081d38]'
                    }`}
                  />
                  {emailsMismatch && (
                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Email addresses do not match yet.</span>
                    </p>
                  )}
                  {emailsMatch && (
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Email addresses match.</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tdex-reg-password"
                    className="block text-sm font-bold text-slate-800"
                  >
                    Password{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (At least 8 characters)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="tdex-reg-password"
                      name="new-password"
                      type={showRegPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      placeholder="Create a strong password (min 8 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-11 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-1"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tdex-reg-confirm-password"
                    className="block text-sm font-bold text-slate-800"
                  >
                    Re-enter Password
                  </label>
                  <input
                    id="tdex-reg-confirm-password"
                    name="confirm-password"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Type your password again"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border-2 focus:outline-none rounded-xl ${
                      passwordsMismatch
                        ? 'border-red-500 focus:border-red-600'
                        : passwordsMatch
                          ? 'border-emerald-600 focus:border-emerald-700'
                          : 'border-slate-300 focus:border-[#081d38]'
                    }`}
                  />
                  {passwordsMismatch && (
                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Passwords do not match.</span>
                    </p>
                  )}
                </div>

                {/* LARGE, HIGH-VISIBILITY VERIFICATION CHECKBOX CARDS */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#081d38]">
                    Required Constitutional Confirmations (Tap Each Box to Check)
                  </div>

                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                      isAdultVerified
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                        : 'bg-[#fbfaf7] border-slate-300 hover:border-[#081d38]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isAdultVerified}
                      onChange={(e) => setIsAdultVerified(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isAdultVerified
                          ? 'bg-[#081d38] border-[#081d38] text-[#dfa62a]'
                          : 'bg-white border-[#081d38]'
                      }`}
                    >
                      {isAdultVerified && <Check className="w-5 h-5 stroke-[3]" />}
                    </span>
                    <span className="text-sm text-slate-800 leading-snug">
                      <strong className="text-[#081d38] block mb-0.5">
                        Article 4.5 Age Verification (18+)
                      </strong>
                      I confirm I am 18 years or older. (Minors participate in the Public Schools
                      Discovery Awards strictly under Parent/Guardian consent.)
                    </span>
                  </label>

                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                      acceptedCharterV10
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                        : 'bg-[#fbfaf7] border-slate-300 hover:border-[#081d38]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={acceptedCharterV10}
                      onChange={(e) => setAcceptedCharterV10(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        acceptedCharterV10
                          ? 'bg-[#081d38] border-[#081d38] text-[#dfa62a]'
                          : 'bg-white border-[#081d38]'
                      }`}
                    >
                      {acceptedCharterV10 && <Check className="w-5 h-5 stroke-[3]" />}
                    </span>
                    <span className="text-sm text-slate-800 leading-snug">
                      <strong className="text-[#081d38] block mb-0.5">
                        The Discovery Exchange Constitution (Version 10.0)
                      </strong>
                      I accept The Discovery Exchange Constitution (Version 10.0), including{' '}
                      <strong>One Owner, One Vote</strong> (Article 4.1) and{' '}
                      <strong>Zero Bosses</strong> (Article 1.2).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#081d38] hover:bg-[#0f294d] disabled:opacity-60 text-[#dfa62a] text-base font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Creating Owner Account...' : 'Complete Owner Registration'}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-700">
                Already have an Owner account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-[#0f4c81] hover:text-[#081d38] underline underline-offset-2 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: DEDICATED PASSWORD RECOVERY ("FORGOT YOUR PASSWORD?")  */}
          {/* ============================================================== */}
          {mode === 'recover' && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#dfa62a]" />
                  <h2 className="font-serif text-2xl font-bold text-[#081d38]">
                    Password Assistance
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] hover:text-[#081d38] underline underline-offset-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              {infoMsg && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-sm text-amber-950 flex items-start gap-2.5">
                  <Mail className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-sm text-red-900 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {recoverStep !== 'reset' ? (
                <form onSubmit={handleRequestRecovery} className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {recoverStep === 'email'
                      ? 'Enter the email address associated with your Owner account. We will help you verify your account and set a new password.'
                      : 'Confirm the Legal Full Name and State/Country Code on your Owner account to unlock your one-time 15-minute recovery code.'}
                  </p>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="tdex-recover-email"
                      className="block text-sm font-bold text-slate-800"
                    >
                      Registered Email Address
                    </label>
                    <input
                      id="tdex-recover-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                    />
                  </div>

                  {recoverStep === 'verify_identity' && (
                    <>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="tdex-recover-name"
                          className="block text-sm font-bold text-slate-800"
                        >
                          Registered Legal Full Name
                        </label>
                        <input
                          id="tdex-recover-name"
                          name="fullName"
                          type="text"
                          autoComplete="name"
                          required
                          placeholder="Exact name used during registration"
                          value={recoverFullName}
                          onChange={(e) => setRecoverFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="tdex-recover-state"
                          className="block text-sm font-bold text-slate-800"
                        >
                          Registered State / Country Code
                        </label>
                        <input
                          id="tdex-recover-state"
                          name="stateCode"
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g., OH, TX, CA"
                          value={recoverStateCode}
                          onChange={(e) => setRecoverStateCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl uppercase"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#081d38] hover:bg-[#0f294d] disabled:opacity-60 text-[#dfa62a] text-base font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting
                      ? 'Checking...'
                      : recoverStep === 'email'
                        ? 'Continue'
                        : 'Verify Owner Identity & Get Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {issuedRecoveryCode && (
                    <div className="p-4 rounded-xl bg-[#081d38] text-white border-2 border-[#dfa62a] text-center space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#dfa62a]">
                        Pre-Launch Verified Recovery Code (Valid 15 Minutes)
                      </div>
                      <div className="font-mono text-2xl font-extrabold tracking-widest text-white">
                        {issuedRecoveryCode}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label
                      htmlFor="tdex-recover-code"
                      className="block text-sm font-bold text-slate-800"
                    >
                      One-Time Recovery Code
                    </label>
                    <input
                      id="tdex-recover-code"
                      name="recoveryCode"
                      type="text"
                      autoComplete="one-time-code"
                      required
                      placeholder="XXXX-XXXX"
                      value={recoveryCodeInput}
                      onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="tdex-new-password"
                      className="block text-sm font-bold text-slate-800"
                    >
                      New Password{' '}
                      <span className="text-xs font-normal text-slate-500">
                        (At least 8 characters)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="tdex-new-password"
                        name="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="Enter a new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-11 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-1"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="tdex-confirm-new-password"
                      className="block text-sm font-bold text-slate-800"
                    >
                      Re-enter New Password
                    </label>
                    <input
                      id="tdex-confirm-new-password"
                      name="confirm-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      placeholder="Re-enter your new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 focus:border-[#081d38] focus:outline-none rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#081d38] hover:bg-[#0f294d] disabled:opacity-60 text-[#dfa62a] text-base font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Saving New Password...' : 'Save New Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Restricted Internal Vault & Audit Log Gate inside Owner Log In Area */}
      <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
              <FolderLock className="w-4 h-4" />
              <span>Authorized Governance Officers Only</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Internal Vault &amp; Audit Log
            </h3>
            <p className="text-xs text-slate-300">
              Restricted portal for Phase 1 Custodian, Internal Arbitration Court, Board Directors
              (with Court Clearance), and AI Oversight.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVaultLogin((prev) => !prev)}
            className="px-4 py-2 rounded-lg bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FolderLock className="w-4 h-4" />
            <span>{showVaultLogin ? 'Hide Internal Vault' : 'Open Internal Vault & Audit Log'}</span>
          </button>
        </div>

        {showVaultLogin && <PrivateVaultPortal embedded />}
      </div>
    </div>
  );
};
