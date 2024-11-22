export interface AuthGuard {
	canActivate(context: { headers: any }): boolean;
}
