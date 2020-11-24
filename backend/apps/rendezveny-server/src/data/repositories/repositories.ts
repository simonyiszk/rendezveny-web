/* eslint-disable max-classes-per-file */
import { Club } from '../models/Club';
import { EntityRepository } from 'typeorm';
import { ClubMembership } from '../models/ClubMembership';
import { Event } from '../models/Event';
import { FormQuestion } from '../models/FormQuestion';
import { FormQuestionAnswer } from '../models/FormQuestionAnswer';
import { FormQuestionTemplate } from '../models/FormQuestionTemplate';
import { HRSegment } from '../models/HRSegment';
import { HRTable } from '../models/HRTable';
import { HRTask } from '../models/HRTask';
import { LocalIdentity } from '../models/LocalIdentity';
import { Organizer } from '../models/Organizer';
import { RefreshToken } from '../models/RefreshToken';
import { Registration } from '../models/Registration';
import { Tag } from '../models/Tag';
import { TemporaryIdentity } from '../models/TemporaryIdentity';
import { User } from '../models/User';
import { BaseRepository } from '../utils/BaseRepository';
import { Log } from '../models/Log';

@EntityRepository(Club)
export class ClubRepository extends BaseRepository<Club> {}

@EntityRepository(ClubMembership)
export class ClubMembershipRepository extends BaseRepository<ClubMembership> {}

@EntityRepository(Event)
export class EventRepository extends BaseRepository<Event> {}

@EntityRepository(FormQuestion)
export class FormQuestionRepository extends BaseRepository<FormQuestion> {}

@EntityRepository(FormQuestionAnswer)
export class FormQuestionAnswerRepository extends BaseRepository<FormQuestionAnswer> {}

@EntityRepository(FormQuestionTemplate)
export class FormQuestionTemplateRepository extends BaseRepository<FormQuestionTemplate> {}

@EntityRepository(HRSegment)
export class HRSegmentRepository extends BaseRepository<HRSegment> {}

@EntityRepository(HRTable)
export class HRTableRepository extends BaseRepository<HRTable> {}

@EntityRepository(HRTask)
export class HRTaskRepository extends BaseRepository<HRTask> {}

@EntityRepository(LocalIdentity)
export class LocalIdentityRepository extends BaseRepository<LocalIdentity> {}

@EntityRepository(Log)
export class LogRepository extends BaseRepository<Log> {}

@EntityRepository(Organizer)
export class OrganizerRepository extends BaseRepository<Organizer> {}

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {}

@EntityRepository(Registration)
export class RegistrationRepository extends BaseRepository<Registration> {}

@EntityRepository(Tag)
export class TagRepository extends BaseRepository<Tag> {}

@EntityRepository(TemporaryIdentity)
export class TemporaryIdentityRepository extends BaseRepository<TemporaryIdentity> {}

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {}