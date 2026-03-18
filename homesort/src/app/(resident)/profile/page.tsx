import Button from "@/components/ui/Button";
import { logout } from "@/lib/auth";

export default function Profile() {
  return (
    <form action={logout}>
      <Button type="submit">LogOut</Button>
    </form>
  );
}
