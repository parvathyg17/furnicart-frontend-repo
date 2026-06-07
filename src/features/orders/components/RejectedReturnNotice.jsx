import {
  formatDateShort,
} from "../../../utils/date.js";

export default function RejectedReturnNotice(
  {
    lastReturn,
    className = "odl-mini-track-note",
  },
) {

  if (
    !lastReturn ||
    lastReturn.status !== "rejected"
  ) {

    return null;
  }

  const note = (
    typeof lastReturn.admin_note === "string"
      ? lastReturn.admin_note.trim()
      : ""
  );

  return (
    <p className={`${className} odl-return-rejected`}>
      <strong>
        Return request rejected
      </strong>

      {
        lastReturn.resolved_at
          ? (
            <>
              {" "}

              <span className="odl-return-rejected-date">
                (
                {formatDateShort(lastReturn.resolved_at)}
                )
              </span>
            </>
          )
          : null
      }

      {
        note
          ? (
            <>
              <br />

              <span className="odl-return-rejected-note">
                {note}
              </span>
            </>
          )
          : null
      }
    </p>
  );
}
