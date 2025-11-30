import { QueryResultDto } from './query-result.dto';

export class QueryResultMapper {
  static toDTO(data: any, error?: any, executionTime?: number): QueryResultDto {
    const dto = new QueryResultDto();
    dto.executionTime = executionTime || 0;

    if (error) {
      dto.message = error.message || 'An error occurred';
      dto.columns = [];
      dto.rows = [];
      return dto;
    }

    if (Array.isArray(data)) {
      if (data.length > 0) {
        dto.columns = Object.keys(data[0]);
        dto.rows = data.map((row) => Object.values(row));
      } else {
        dto.columns = [];
        dto.rows = [];
      }
      dto.message = 'Query executed successfully.';
    } else {
      dto.columns = [];
      dto.rows = [];
      dto.message = 'Query executed successfully.';
    }

    return dto;
  }
}