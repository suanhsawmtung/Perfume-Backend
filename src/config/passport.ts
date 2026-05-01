import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { UserService } from "../services/user/user.service";
import { env } from "./env";

const userService = new UserService();

passport.use(
    new GoogleStrategy(
        {
            clientID: env.googleClientId!,
            clientSecret: env.googleClientSecret!,
            callbackURL: `${env.serverUrl}/api/v1/auth/google/callback`,
            passReqToCallback: false,
        },
        async (
            _accessToken: string,
            _refreshToken: string,
            profile: Profile,
            done: (err: any, user?: any) => void,
        ) => {
            try {
                const { data: dbUser } = await userService.findOrCreateByGoogle(profile);
                done(null, dbUser);
            } catch (err) {
                done(err as Error, undefined);
            }
        },
    ),
);

export default passport;
