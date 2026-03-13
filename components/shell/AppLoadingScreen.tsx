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
        <div className="relative h-28 w-28 animate-spin [animation-duration:1.1s]">
          {spinnerDots.map((dot) => (
            <span
              key={dot}
              className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                transform: `translate(-50%, -50%) rotate(${dot * 30}deg) translateY(-48px)`,
                backgroundColor: `rgba(15, 23, 42, ${0.14 + dot * 0.06})`,
              }}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-2xl font-medium uppercase tracking-wide text-slate-700">
          {label}
        </p>
      </div>
    </div>
  );
}
