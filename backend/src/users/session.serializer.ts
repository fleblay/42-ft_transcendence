import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

// This class is used to serialize and deserialize the user object
// serialized user object is stored in the session
// deserialized user object is attached to the request object as req.user

@Injectable()
export class SessionSerializer extends PassportSerializer {
	  serializeUser(user: any, done: (err: Error, user: any) => void): any {
	done(null, user);
  }

  deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
	done(null, payload);
  }
}