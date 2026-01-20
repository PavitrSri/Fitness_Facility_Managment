import {auth, register, getUser} from '../components/UserManagement';

test('Password Hashing', async () => {
	let user = {"email":"test", "passwordHash":"$2a$10$d6h7z1Wwf3iSPL5ZXv/ca.AEh2zmtyflBEUU/Wc2JFYYGZ6PqDIx6"};
	expect(await auth(user, "123")).toBe(true);
});

