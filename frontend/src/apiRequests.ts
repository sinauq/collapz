export const apiBase = "http://localhost:3000/api";

export function postLogin(userName: string) {
  return {
    url: `${apiBase}/users`,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userName, role: "researcher" }),
    },
  };
}

export function getNotes(id: string | void) {
  const param = id ? `/${id}` : "";

  return {
    url: `${apiBase}/notes${param}`,
  };
}

export function patchNote(id: number, content: string) {
  return {
    url: `${apiBase}/notes/${id}`,
    options: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  };
}
