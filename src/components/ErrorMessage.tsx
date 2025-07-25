interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({message}: ErrorMessageProps) {
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
