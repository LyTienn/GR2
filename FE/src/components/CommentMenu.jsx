import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CommentMenu = ({ commentId, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}>
        <MoreVertical className="w-5 h-5" />
      </button>
      <div
        className={`
          absolute right-0 mt-2 bg-white border rounded shadow z-10
          transition-all duration-200 ease-in-out
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
        `}
        style={{ minWidth: 120 }}
        aria-hidden={!open}
        role="menu"
      >
        <button
          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          onClick={() => { setOpen(false); onEdit(commentId); }}
        >
          {t("components.reviewsection.editBtn")}
        </button>
        <button
          className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
          onClick={() => { setOpen(false); onDelete(commentId); }}
        >
          {t("components.reviewsection.deleteBtn")}
        </button>
      </div>
    </div>
  );
}

export default CommentMenu;