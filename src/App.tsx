import { Location } from "react-router-dom";
import RootProvider from "./providers/RootProvider";
import AppRouter from "./routing";

function App({ url }: { url?: string | Partial<Location<any>> }) {
  return (
    <RootProvider>
      <AppRouter url={url} />
    </RootProvider>
  );
}

export default App;
