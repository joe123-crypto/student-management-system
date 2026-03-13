interface AppLoadingScreenProps {
  label?: string;
}

const spinnerDots = Array.from({ length: 12 }, (_, index) => index);

export default function AppLoadingScreen({
  label = 'Loading your workspace...',
}: AppLoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="flex flex-col items-center">
        <div className="relative h-20 w-20">
          {spinnerDots.map((dot) => (
            <span
              key={dot}
              className="absolute left-1/2 top-1/2 h-3.5 w-3.5 rounded-full bg-slate-700"
              style={{
                transform: `translate(-50%, -50%) rotate(${dot * 30}deg) translateY(-34px)`,
                animation: 'loading-dot-fade 1.2s linear infinite',
                animationDelay: `${dot * -0.1}s`,
              }}
            />
          ))}
        </div>
        <p className="mt-6 text-center text-lg font-medium uppercase tracking-[0.18em] text-slate-600">
          {label}
        </p>
      </div>
    </div>
  );
}
