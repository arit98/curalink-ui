import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

createRoot(document.getElementById("root")!).render(
    <>
        <App />
        {/* <CopilotPopup
            instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
            labels={{
                title: "Popup Assistant",
                initial: "Need any help?",
            }}
        /> */}
    </>
);
