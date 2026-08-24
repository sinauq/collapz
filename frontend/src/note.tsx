import { useParams } from "react-router";

export default () => {
  const { id } = useParams();

  return <h1>Note View {id}</h1>;
};
