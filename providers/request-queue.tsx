import { createContext, useContext, useState } from "react";

type RequestContextType = {
  url: string;
  setUrl: (url: string) => void;
  quizSetId: string;
  setQuizSetId: (quizSetId: string) => void;
};

const RequestContext = createContext<RequestContextType>({
  url: "",
  setUrl: () => {},
  quizSetId: "",
  setQuizSetId: () => {},
});

export const RequestProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [url, setUrl] = useState("");
  const [quizSetId, setQuizSetId] = useState("");

  return (
    <RequestContext.Provider value={{ url, setUrl, quizSetId, setQuizSetId }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => {
  return useContext(RequestContext);
};
