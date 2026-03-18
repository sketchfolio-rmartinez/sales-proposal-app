interface EditorStepExportsProps {
  exportText: string;
  exportCsv: string;
  onDownloadCsv: () => void;
}

export function EditorStepExports({
  exportText,
  exportCsv,
  onDownloadCsv,
}: EditorStepExportsProps) {
  return (
    <div className="panel">
      <h3>Exports</h3>
      <div className="row wrap">
        <button onClick={onDownloadCsv} disabled={!exportCsv}>
          Download Teamwork CSV
        </button>
      </div>
      <label>
        Proposal Text Output
        <textarea value={exportText} readOnly rows={16} />
      </label>
      <label>
        Teamwork CSV Preview
        <textarea value={exportCsv} readOnly rows={8} />
      </label>
    </div>
  );
}
