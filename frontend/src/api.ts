import { useEffect, useState } from "react";

const apiBase = "http://localhost:3000/api";

type FetchObject = {
  url: string;
  method?: string;
  body?: BodyInit;
};

export function useFetch(fetcher: FetchObject): [any | null, boolean] {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { url, method, body } = fetcher;

  useEffect(() => {
    setTimeout(() => {
      fetch(url, { method, body })
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setIsLoading(false);
        })
        .catch((err) => err.json())
        .finally(() => {
          setIsLoading(false);
        });
    }, 1000);
  }, []);

  return [data, isLoading];
}

export function postLogin(userName: string) {
  return {
    url: `${apiBase}/users`,
    method: "POST",
    body: JSON.stringify({ name: userName, role: "researcher" }),
  };
}

export function getNotes(id: string | void) {
  const param = id ? `/${id}` : "";

  return {
    url: `${apiBase}/notes${param}`,
  };
}
