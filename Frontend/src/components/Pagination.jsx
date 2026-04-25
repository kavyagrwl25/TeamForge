import Pagination from "@mui/material/Pagination";

function PaginationComponent({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => onPageChange(value)}
        color="primary"
        shape="rounded"
      />
    </div>
  );
}

export default PaginationComponent;