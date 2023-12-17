export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-5xl font-bold">
        DocQuiz
        <span className="text-2xl ml-1 align-top">β</span>
      </h1>
      <p className="text-2xl !leading-tight mx-auto max-w-xl text-center">
        Generate quizzes from web documents!
      </p>
    </div>
  );
}
