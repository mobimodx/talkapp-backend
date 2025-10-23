import { User, UserResponse, RegisterRequest } from '../types';
declare class UserModel {
    create(data: RegisterRequest): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: number, data: Partial<User>): Promise<User>;
    delete(id: number): Promise<void>;
    toResponse(user: User): UserResponse;
}
declare const _default: UserModel;
export default _default;
//# sourceMappingURL=user.model.d.ts.map