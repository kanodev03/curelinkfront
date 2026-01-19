export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <div
        className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
        style={{ borderColor: '#038474' }}
      ></div>
    </div>
  );
}