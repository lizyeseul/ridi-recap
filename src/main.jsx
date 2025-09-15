import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Index from "./Index"
import DB from "@/scripts/connect_db.js"
import SESSION from "@/scripts/session.js"
import UTIL from "@/scripts/utils.js"

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Index />
  // </StrictMode>,
)
