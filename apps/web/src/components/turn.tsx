import clsx from "clsx";
import { useEffect } from "react";
import {
  UserCircleIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

import { useRemark } from "react-remark";
import remarkGemoji from "remark-gemoji";
import { ChatTurn } from "@/lib/types";

type Props = {
  turn: ChatTurn;
};

export const Turn = ({ turn }: Props) => {
  const [reactContent, setMarkdownSource] = useRemark({
    //@ts-ignore
    remarkPlugins: [remarkGemoji],
    remarkToRehypeOptions: { allowDangerousHtml: true },
    rehypeReactOptions: {},
  });

  useEffect(() => {
    setMarkdownSource(turn.message);
  }, [turn, setMarkdownSource]);

  const getContent = (turn: ChatTurn) => {
    if (turn.status === "waiting") {
      return (
        <div className="ml-2 flex flex-row" role="status">
          <svg
            className="animate-spin motion-reduce:animate-none -ml-1 mr-2 h-5 w-5 text-zinc-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <div>{turn.message}</div>
        </div>
      );
    } else {
      return (
        <div>
          <div
            className={clsx(
              "[&_a]:text-sky-800 [&_ul]:list-disc [&_ul]:list-outside [&_li]:ml-5 sm:[&_li]:ml-9 p-1 [&_ul]:pt-2 [&_ul]:pb-2",
              "[&_a]:font-semibold"
            )}
          >
            {reactContent || turn.message}
          </div>
        </div>
      );
    }
  };

  // Gutters were a flat 96px. Inside a 358px panel at 390px that left a 218px
  // content column — 39% fixed gutter — wrapping product names onto two lines.
  //
  // `max-w-[46ch]` caps the other end. The gutters are fixed, so from 640 up the
  // content column grew with the panel without limit: once #183 made the panel a
  // full-screen sheet to 1023, a reply ran 81 characters per line at 834 and 103
  // at 1023, against the 45–75 that is comfortable to read. The cap binds only
  // where the panel is wide enough to exceed it, so the 390 measure above is
  // untouched.
  //
  // `justify-end` is the cap's other half. While the bubble filled the column,
  // which side a turn sat on was not a signal and only colour told them apart.
  // Capped, it is a signal — and the default one pointed backwards: the
  // assistant's bubble landed further right than the shopper's own, measured at
  // 834 as assistant 228–649 against user 185–606. Main-end is the left for the
  // row-reverse assistant row and the right for the user row, so one class puts
  // each turn on the side every chat interface puts it.
  if (turn.type === "user") {
    return (
      <div className="ml-8 sm:ml-24 flex justify-end gap-1">
        <div className="grow min-w-0 max-w-[46ch] break-words bg-sky-700 text-zinc-100 p-2 rounded-md">
          {getContent(turn)}
        </div>
        <div>
          <UserCircleIcon className="w-6 stroke-zinc-500" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row-reverse justify-end gap-1 mr-8 sm:mr-24">
        <div className="grow min-w-0 max-w-[46ch] break-words bg-zinc-200 text-zinc-600 p-2 rounded-md">
          {getContent(turn)}
        </div>
        <div>
          <BuildingStorefrontIcon className="w-6 stroke-zinc-500" />
        </div>
      </div>
    );
  }
};

export default Turn;
