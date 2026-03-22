export default function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 p-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      <span className="text-sm text-gray-500">{text}</span>
    </div>
  );
}
