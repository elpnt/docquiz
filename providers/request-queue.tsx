import { createContext, useContext, useState } from "react";

type RequestContextType = {
  quizSetId: string | null;
  setQuizSetId: (quizSetId: string | null) => void;
  pending: boolean;
  setPending: (pending: boolean) => void;
};

const RequestContext = createContext<RequestContextType>({
  quizSetId: null,
  setQuizSetId: () => {},
  pending: false,
  setPending: () => {},
});

export const RequestProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [quizSetId, setQuizSetId] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);

  return (
    <RequestContext.Provider
      value={{ quizSetId, setQuizSetId, pending, setPending }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => {
  return useContext(RequestContext);
};
