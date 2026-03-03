import { Observable } from 'rxjs';
import { RequestType } from './request.interface';
import { ResponseType } from './response.interface';

// custom TCP client interface từ thằng Client Proxy của NestJS Microservices
// ClientProxy có 2 method chính là send và emit, mình sẽ custom lại theo kiểu generic để dễ sử dụng hơn. Cả 2 method đều nhận pattern (để định tuyến message) và data (dữ liệu gửi đi), và trả về Observable của ResponseType với kiểu dữ liệu kết quả tùy chỉnh.

// 2 method này đọc trong type của nó khi ctrl + click vào ClientProxy để xem và custom lại theo kiểu generic
export interface TcpClient {
  send<TResult = any, TInput = any>(pattern: any, data: RequestType<TInput>): Observable<ResponseType<TResult>>;
  emit<TResult = any, TInput = any>(pattern: any, data: RequestType<TInput>): Observable<ResponseType<TResult>>;
}
