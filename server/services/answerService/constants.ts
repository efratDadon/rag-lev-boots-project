export const UNANSWERABLE_MESSAGE =
  "I don't have enough information in the Lev-Boots knowledge base to answer that question.";

// pgvector cosine distance via `<=>`: 0 = identical, 2 = opposite.
// Empirically calibrated: on-topic ~0.22, in-vocab-but-unanswerable ~0.30,
// wildly off-topic ~0.49 for this corpus/embedding model. 0.4 separates the
// off-topic case from the other two with margin on both sides.
export const MAX_RELEVANT_DISTANCE = 0.4;
