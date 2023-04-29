export interface createActorInterface {
  roleName: string;
  actor: {
    connect: { id: number };
  };
}
