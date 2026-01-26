import type {
  ApiResponse,
  CreateSessionResponse,
  ValidateSessionResponse,
  ListQuizzesResponse,
  GetQuizResponse,
  StartAttemptRequest,
  StartAttemptResponse,
  SaveProgressRequest,
  SaveProgressResponse,
  SubmitQuizResponse,
  GetResultsResponse,
  GetHistoryResponse,
} from "shared";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || "An error occurred",
        response.status,
        data,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error", 0);
  }
}

// ============================================
// Session API
// ============================================

export const sessionApi = {
  /**
   * Create a new anonymous session
   */
  create: async (): Promise<CreateSessionResponse> => {
    const response = await fetchApi<ApiResponse<CreateSessionResponse>>(
      "/sessions",
      {
        method: "POST",
      },
    );
    return response.data!;
  },

  /**
   * Validate and refresh an existing session
   */
  validate: async (token: string): Promise<ValidateSessionResponse> => {
    const response = await fetchApi<ApiResponse<ValidateSessionResponse>>(
      `/sessions/${token}`,
    );
    return response.data!;
  },
};

// ============================================
// Quiz API
// ============================================

export const quizApi = {
  /**
   * List all active quizzes
   */
  list: async (): Promise<ListQuizzesResponse> => {
    const response =
      await fetchApi<ApiResponse<ListQuizzesResponse>>("/quizzes");
    return response.data!;
  },

  /**
   * Get quiz details with questions
   */
  get: async (quizId: string): Promise<GetQuizResponse> => {
    const response = await fetchApi<ApiResponse<GetQuizResponse>>(
      `/quizzes/${quizId}`,
    );
    return response.data!;
  },
};

// ============================================
// Attempt API
// ============================================

export const attemptApi = {
  /**
   * Start a new quiz attempt
   */
  start: async (data: StartAttemptRequest): Promise<StartAttemptResponse> => {
    const response = await fetchApi<ApiResponse<StartAttemptResponse>>(
      "/attempts",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response.data!;
  },

  /**
   * Get attempt details (for resuming)
   */
  get: async (attemptId: string): Promise<StartAttemptResponse> => {
    const response = await fetchApi<ApiResponse<StartAttemptResponse>>(
      `/attempts/${attemptId}`,
    );
    return response.data!;
  },

  /**
   * Save quiz progress
   */
  saveProgress: async (
    attemptId: string,
    data: SaveProgressRequest,
  ): Promise<SaveProgressResponse> => {
    const response = await fetchApi<ApiResponse<SaveProgressResponse>>(
      `/attempts/${attemptId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return response.data!;
  },

  /**
   * Submit completed quiz
   */
  submit: async (attemptId: string): Promise<SubmitQuizResponse> => {
    const response = await fetchApi<ApiResponse<SubmitQuizResponse>>(
      `/attempts/${attemptId}/submit`,
      {
        method: "POST",
      },
    );
    return response.data!;
  },

  /**
   * Get detailed results for an attempt
   */
  getResults: async (attemptId: string): Promise<GetResultsResponse> => {
    const response = await fetchApi<ApiResponse<GetResultsResponse>>(
      `/attempts/${attemptId}/results`,
    );
    return response.data!;
  },

  /**
   * Get all attempts for a session
   */
  getHistory: async (sessionToken: string): Promise<GetHistoryResponse> => {
    const response = await fetchApi<ApiResponse<GetHistoryResponse>>(
      `/sessions/${sessionToken}/attempts`,
    );
    return response.data!;
  },
};
