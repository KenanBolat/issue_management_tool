pg_dump: last built-in OID is 16383
pg_dump: reading extensions
pg_dump: identifying extension members
pg_dump: reading schemas
pg_dump: reading user-defined tables
pg_dump: reading user-defined functions
pg_dump: reading user-defined types
pg_dump: reading procedural languages
pg_dump: reading user-defined aggregate functions
pg_dump: reading user-defined operators
pg_dump: reading user-defined access methods
pg_dump: reading user-defined operator classes
pg_dump: reading user-defined operator families
pg_dump: reading user-defined text search parsers
pg_dump: reading user-defined text search templates
pg_dump: reading user-defined text search dictionaries
pg_dump: reading user-defined text search configurations
pg_dump: reading user-defined foreign-data wrappers
pg_dump: reading user-defined foreign servers
pg_dump: reading default privileges
pg_dump: reading user-defined collations
pg_dump: reading user-defined conversions
pg_dump: reading type casts
pg_dump: reading transforms
pg_dump: reading table inheritance information
pg_dump: reading event triggers
pg_dump: finding extension tables
pg_dump: finding inheritance relationships
pg_dump: reading column info for interesting tables
pg_dump: flagging inherited columns in subtables
pg_dump: reading partitioning data
pg_dump: reading indexes
pg_dump: flagging indexes in partitioned tables
pg_dump: reading extended statistics
pg_dump: reading constraints
pg_dump: reading triggers
pg_dump: reading rewrite rules
pg_dump: reading policies
pg_dump: reading row-level security policies
pg_dump: reading publications
pg_dump: reading publication membership of tables
pg_dump: reading publication membership of schemas
pg_dump: reading subscriptions
pg_dump: reading large objects
pg_dump: reading dependency data
pg_dump: saving encoding = UTF8
pg_dump: saving standard_conforming_strings = on
pg_dump: saving search_path = 
pg_dump: saving database definition
pg_dump: dropping DATABASE satellite_tickets
pg_dump: creating DATABASE "satellite_tickets"
pg_dump: connecting to new database "satellite_tickets"
--
-- PostgreSQL database dump
--

\restrict 0wIaBEUjs2FXMevTbUYEcDC19SO3BQEAa4HQrFB2fE3aB0pDLOb5ehHCHXmLFRp

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2025-11-26 03:50:01 +03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS satellite_tickets;
--
-- TOC entry 3675 (class 1262 OID 21999)
-- Name: satellite_tickets; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE satellite_tickets WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE satellite_tickets OWNER TO postgres;

\unrestrict 0wIaBEUjs2FXMevTbUYEcDC19SO3BQEAa4HQrFB2fE3aB0pDLOb5ehHCHXmLFRp
\connect satellite_tickets
\restrict 0wIaBEUjs2FXMevTbUYEcDC19SO3BQEAa4HQrFB2fE3aB0pDLOb5ehHCHXmLFRp

pg_dump: creating TYPE "public.activity_check_result"
pg_dump: creating TYPE "public.notification_method"
pg_dump: creating TABLE "public.Attachments"
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 879 (class 1247 OID 22006)
-- Name: activity_check_result; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.activity_check_result AS ENUM (
    'pending',
    'approved',
    'rejected',
    'needs_revision'
);


ALTER TYPE public.activity_check_result OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 22016)
-- Name: notification_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_method AS ENUM (
    'email',
    'telephone',
    'briefing',
    'verbal'
);


ALTER TYPE public.notification_method OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 233 (class 1259 OID 22158)
pg_dump: creating SEQUENCE "public.Attachments_Id_seq"
pg_dump: creating TABLE "public.CIJobs"
-- Name: Attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attachments" (
    "Id" bigint NOT NULL,
    "TicketId" bigint NOT NULL,
    "FileName" text NOT NULL,
    "ContentType" text NOT NULL,
    "Size" bigint NOT NULL,
    "StoragePath" text NOT NULL,
    "UploadedById" bigint NOT NULL,
    "UploadedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Attachments" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 22157)
-- Name: Attachments_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Attachments" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Attachments_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 22176)
-- Name: CIJobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CIJobs" (
    "Id" bigint NOT NULL,
    "TicketId" bigint NOT NULL,
    "CiRunId" text NOT NULL,
    "Status" character varying(50) NOT NULL,
    "CompletedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL
);


pg_dump: creating SEQUENCE "public.CIJobs_Id_seq"
pg_dump: creating TABLE "public.Components"
pg_dump: creating SEQUENCE "public.Components_Id_seq"
pg_dump: creating TABLE "public.ConfigurationItems"
ALTER TABLE public."CIJobs" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 22175)
-- Name: CIJobs_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."CIJobs" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."CIJobs_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 22102)
-- Name: Components; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Components" (
    "Id" bigint NOT NULL,
    "Name" text NOT NULL,
    "SubsystemId" bigint
);


ALTER TABLE public."Components" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 22101)
-- Name: Components_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Components" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Components_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 217 (class 1259 OID 22026)
pg_dump: creating SEQUENCE "public.ConfigurationItems_Id_seq"
pg_dump: creating TABLE "public.MilitaryRanks"
-- Name: ConfigurationItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ConfigurationItems" (
    "Id" bigint NOT NULL,
    "Name" text NOT NULL,
    "Description" text
);


ALTER TABLE public."ConfigurationItems" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 22025)
-- Name: ConfigurationItems_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ConfigurationItems" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."ConfigurationItems_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 22034)
-- Name: MilitaryRanks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MilitaryRanks" (
    "Id" integer NOT NULL,
    "Code" character varying(100) NOT NULL,
    "DisplayName" character varying(200) NOT NULL,
    "Description" character varying(500),
    "SortOrder" integer NOT NULL,
    "IsActive" boolean NOT NULL
);


ALTER TABLE public."MilitaryRanks" OWNER TO postgres;

pg_dump: creating SEQUENCE "public.MilitaryRanks_Id_seq"
pg_dump: creating TABLE "public.NotificationActions"
pg_dump: creating SEQUENCE "public.NotificationActions_Id_seq"
--
-- TOC entry 218 (class 1259 OID 22033)
-- Name: MilitaryRanks_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."MilitaryRanks" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."MilitaryRanks_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 247 (class 1259 OID 22334)
-- Name: NotificationActions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationActions" (
    "Id" bigint NOT NULL,
    "NotificationId" bigint NOT NULL,
    "UserId" bigint NOT NULL,
    "ActionType" character varying(50) NOT NULL,
    "ActionData" text,
    "Notes" text,
    "PerformedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."NotificationActions" OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 22333)
-- Name: NotificationActions_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."NotificationActions" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."NotificationActions_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


pg_dump: creating TABLE "public.NotificationReads"
pg_dump: creating SEQUENCE "public.NotificationReads_Id_seq"
pg_dump: creating TABLE "public.Notifications"
--
-- TOC entry 249 (class 1259 OID 22352)
-- Name: NotificationReads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationReads" (
    "Id" bigint NOT NULL,
    "NotificationId" bigint NOT NULL,
    "UserId" bigint NOT NULL,
    "ReadAt" timestamp with time zone NOT NULL,
    "ReadFrom" text
);


ALTER TABLE public."NotificationReads" OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 22351)
-- Name: NotificationReads_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."NotificationReads" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."NotificationReads_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 245 (class 1259 OID 22306)
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id bigint NOT NULL,
    notification_type integer NOT NULL,
    notification_priority integer NOT NULL,
    ticket_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    message character varying(1000) NOT NULL,
    action_url text,
    created_by_user_id bigint NOT NULL,
    is_global boolean NOT NULL,
    target_user_id bigint,
    target_role text,
    requires_action boolean NOT NULL,
    is_resolved boolean NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by_user_id bigint,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone
);


pg_dump: creating SEQUENCE "public.Notifications_id_seq"
pg_dump: creating TABLE "public.ProgressRequests"
ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 22305)
-- Name: Notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Notifications" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 251 (class 1259 OID 22380)
-- Name: ProgressRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProgressRequests" (
    "Id" bigint NOT NULL,
    ticket_id bigint NOT NULL,
    requested_by_user_id bigint NOT NULL,
    target_user_id bigint NOT NULL,
    request_message text,
    requested_at timestamp with time zone NOT NULL,
    due_date timestamp with time zone,
    is_responded boolean NOT NULL,
    responded_at timestamp with time zone,
    responded_by_user_id bigint,
    response_action_id bigint,
    status character varying(50) NOT NULL,
    notification_id bigint
);


pg_dump: creating SEQUENCE "public.ProgressRequests_Id_seq"
pg_dump: creating TABLE "public.Subsystems"
pg_dump: creating SEQUENCE "public.Subsystems_Id_seq"
ALTER TABLE public."ProgressRequests" OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 22379)
-- Name: ProgressRequests_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ProgressRequests" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."ProgressRequests_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 22073)
-- Name: Subsystems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subsystems" (
    "Id" bigint NOT NULL,
    "Name" text NOT NULL,
    "SystemId" bigint
);


ALTER TABLE public."Subsystems" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 22072)
-- Name: Subsystems_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Subsystems" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Subsystems_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


pg_dump: creating TABLE "public.Systems"
pg_dump: creating SEQUENCE "public.Systems_Id_seq"
pg_dump: creating TABLE "public.TicketActions"
--
-- TOC entry 221 (class 1259 OID 22042)
-- Name: Systems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Systems" (
    "Id" bigint NOT NULL,
    "Name" text NOT NULL
);


ALTER TABLE public."Systems" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 22041)
-- Name: Systems_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Systems" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Systems_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 22204)
-- Name: TicketActions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TicketActions" (
    "Id" bigint NOT NULL,
    "TicketId" bigint NOT NULL,
    "ActionType" character varying(50) NOT NULL,
    "FromStatus" character varying(50),
    "ToStatus" character varying(50),
    "Notes" text,
    "PerformedById" bigint NOT NULL,
    "PerformedAt" timestamp with time zone NOT NULL
);


pg_dump: creating SEQUENCE "public.TicketActions_Id_seq"
pg_dump: creating TABLE "public.TicketComments"
pg_dump: creating SEQUENCE "public.TicketComments_Id_seq"
ALTER TABLE public."TicketActions" OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 22203)
-- Name: TicketActions_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."TicketActions" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TicketActions_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 22222)
-- Name: TicketComments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TicketComments" (
    "Id" bigint NOT NULL,
    "TicketId" bigint NOT NULL,
    "Body" text NOT NULL,
    "CreatedById" bigint NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TicketComments" OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 22221)
-- Name: TicketComments_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."TicketComments" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TicketComments_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


pg_dump: creating TABLE "public.UserPermissions"
pg_dump: creating SEQUENCE "public.UserPermissions_Id_seq"
pg_dump: creating TABLE "public.__EFMigrationsHistory"
--
-- TOC entry 227 (class 1259 OID 22086)
-- Name: UserPermissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserPermissions" (
    "Id" bigint NOT NULL,
    "UserId" bigint NOT NULL,
    "PermissionType" integer NOT NULL,
    "CanView" boolean NOT NULL,
    "CanCreate" boolean NOT NULL,
    "CanEdit" boolean NOT NULL,
    "CanDelete" boolean NOT NULL,
    "GrantedAt" timestamp with time zone NOT NULL,
    "GrantedById" bigint NOT NULL
);


ALTER TABLE public."UserPermissions" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 22085)
-- Name: UserPermissions_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."UserPermissions" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."UserPermissions_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 215 (class 1259 OID 22000)
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


pg_dump: creating TABLE "public.configuration"
pg_dump: creating SEQUENCE "public.configuration_id_seq"
pg_dump: creating TABLE "public.ticket"
ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 22294)
-- Name: configuration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuration (
    id bigint NOT NULL,
    expiration_date timestamp with time zone,
    pdfreport_date timestamp with time zone NOT NULL,
    is_active boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    updated_date timestamp with time zone NOT NULL,
    updated_by_id bigint
);


ALTER TABLE public.configuration OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 22293)
-- Name: configuration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.configuration ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.configuration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 22115)
-- Name: ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket (
    id bigint NOT NULL,
    external_code character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    description text NOT NULL,
    is_blocking boolean NOT NULL,
    status character varying(50) NOT NULL,
    confirmation_status character varying(50),
    technical_report_required boolean NOT NULL,
    ci_id bigint,
    component_id bigint,
    subsystem_id bigint,
    system_id bigint,
    item_description text,
    item_id text,
    item_serial_no text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    reaction_date timestamp with time zone,
    resolution_date timestamp with time zone,
    created_by_id bigint NOT NULL,
    last_updated_by_id bigint,
    is_active boolean NOT NULL,
    is_deleted boolean NOT NULL,
    detected_date timestamp with time zone,
    detected_contractor_notified_at timestamp with time zone,
    detected_notification_methods integer[],
    detected_by_user_id bigint,
    response_date timestamp with time zone,
    response_resolved_at timestamp with time zone,
    activity_control_commander_id bigint,
    activity_control_date timestamp with time zone,
    activity_control_personnel_id bigint,
    activity_control_result text,
    response_actions text,
    ttcoms_code text,
    response_resolved_by_user_id bigint,
    hp_no text,
    new_item_description text,
    new_item_id text,
    new_item_serial_no text,
    tentative_solution_date timestamp with time zone,
    activity_control_status integer,
    sub_contractor text,
    sub_contractor_notified_at timestamp with time zone
);


pg_dump: creating SEQUENCE "public.ticket_id_seq"
pg_dump: creating TABLE "public.ticket_response_personnel"
pg_dump: creating TABLE "public.ticket_response_resolved_personnel"
pg_dump: creating TABLE "public.user"
ALTER TABLE public.ticket OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 22114)
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ticket ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 22188)
-- Name: ticket_response_personnel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_response_personnel (
    ticket_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.ticket_response_personnel OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 22276)
-- Name: ticket_response_resolved_personnel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_response_resolved_personnel (
    ticket_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.ticket_response_resolved_personnel OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 22050)
pg_dump: creating SEQUENCE "public.user_id_seq"
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    display_name character varying(100) NOT NULL,
    role integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    is_active boolean NOT NULL,
    phone_number character varying(20),
    affiliation integer,
    department text,
    military_rank_id integer,
    rank_code character varying(100),
    preferred_language character varying(10),
    created_by_id bigint,
    last_updated_by_id bigint,
    "position" integer
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 22049)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."user" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


pg_dump: processing data for table "public.Attachments"
pg_dump: dumping contents of table "public.Attachments"
pg_dump: processing data for table "public.CIJobs"
pg_dump: dumping contents of table "public.CIJobs"
pg_dump: processing data for table "public.Components"
pg_dump: dumping contents of table "public.Components"
pg_dump: processing data for table "public.ConfigurationItems"
--
-- TOC entry 3651 (class 0 OID 22158)
-- Dependencies: 233
-- Data for Name: Attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attachments" ("Id", "TicketId", "FileName", "ContentType", "Size", "StoragePath", "UploadedById", "UploadedAt") FROM stdin;
\.


--
-- TOC entry 3653 (class 0 OID 22176)
-- Dependencies: 235
-- Data for Name: CIJobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CIJobs" ("Id", "TicketId", "CiRunId", "Status", "CompletedAt", "CreatedAt") FROM stdin;
\.


--
-- TOC entry 3647 (class 0 OID 22102)
-- Dependencies: 229
-- Data for Name: Components; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Components" ("Id", "Name", "SubsystemId") FROM stdin;
1	Yazılım	1
2	Donanım	\N
3	Prosedür	\N
\.


--
-- TOC entry 3635 (class 0 OID 22026)
-- Dependencies: 217
-- Data for Name: ConfigurationItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ConfigurationItems" ("Id", "Name", "Description") FROM stdin;
pg_dump: dumping contents of table "public.ConfigurationItems"
pg_dump: processing data for table "public.MilitaryRanks"
pg_dump: dumping contents of table "public.MilitaryRanks"
1	SPC	\N
2	ANT	\N
3	CAD	\N
4	CDE	\N
5	CQS	\N
6	DHF	\N
7	DSS	\N
8	FDS	\N
9	Genel	\N
10	GIS	\N
11	IES	\N
12	IPS	\N
13	MFS	\N
14	MP	\N
15	MTZ-PLF	\N
16	NET-EQUIP	\N
17	PROCEDIT	\N
18	SAP	\N
19	SAW	\N
20	SHL	\N
21	SSPA	\N
22	SSS	\N
23	T&F	\N
24	TU-EXT-I/F	\N
25	X-BBB	\N
\.


--
-- TOC entry 3637 (class 0 OID 22034)
-- Dependencies: 219
-- Data for Name: MilitaryRanks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MilitaryRanks" ("Id", "Code", "DisplayName", "Description", "SortOrder", "IsActive") FROM stdin;
1	HV_ISTH_ASB_BCVS	Hv.İsth.Asb.Bçvş	\N	1	t
2	HV_ISTH_ASB_KD_BCVS	Hv.İsth.Asb.Kd.Bçvş	\N	2	t
3	HV_ISTH_ASB_KD_CVS	Hv.İsth.Asb.Kd.Çvş	\N	4	t
4	HV_ISTH_ASB_KD_UCVS	Hv.İsth.Asb.Kd.Üçvş	\N	5	t
5	HV_ISTH_ASB_CVS	Hv.İsth.Asb.Çvş	\N	6	t
6	HV_ISTH_UTGM	Hv.İsth.Ütğm	\N	7	t
7	HV_MU_ASB_BCVS	Hv.Mu.Asb.Bçvş	\N	8	t
8	HV_MU_ASB_KD_BCVS	Hv.Mu.Asb.Kd.Bçvş	\N	9	t
9	HV_MU_ASB_KD_CVS	Hv.Mu.Asb.Kd.Çvş	\N	10	t
10	HV_MU_ASB_KD_UCVS	Hv.Mu.Asb.Kd.Üçvş	\N	11	t
11	HV_MU_ASB_CVS	Hv.Mu.Asb.Çvş	\N	12	t
pg_dump: processing data for table "public.NotificationActions"
pg_dump: dumping contents of table "public.NotificationActions"
pg_dump: processing data for table "public.NotificationReads"
pg_dump: dumping contents of table "public.NotificationReads"
12	HV_MUH_YZB	Hv.Müh.Yzb	\N	13	t
13	HV_MUH_UTGM	Hv.Müh.Ütğm	\N	14	t
17	a	a	a	15	t
18	b	a	\N	16	t
\.


--
-- TOC entry 3665 (class 0 OID 22334)
-- Dependencies: 247
-- Data for Name: NotificationActions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationActions" ("Id", "NotificationId", "UserId", "ActionType", "ActionData", "Notes", "PerformedAt") FROM stdin;
\.


--
-- TOC entry 3667 (class 0 OID 22352)
-- Dependencies: 249
-- Data for Name: NotificationReads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationReads" ("Id", "NotificationId", "UserId", "ReadAt", "ReadFrom") FROM stdin;
15	13	3	2025-11-25 00:16:56.82947+00	\N
16	13	2	2025-11-25 00:19:40.847139+00	\N
17	13	1	2025-11-25 12:10:37.924362+00	\N
18	17	1	2025-11-25 12:24:06.211778+00	\N
19	16	1	2025-11-25 12:24:08.906069+00	\N
20	19	1	2025-11-25 23:33:41.122276+00	\N
21	20	1	2025-11-26 00:42:39.560403+00	\N
22	18	1	2025-11-26 00:42:43.508408+00	\N
\.


--
-- TOC entry 3663 (class 0 OID 22306)
pg_dump: processing data for table "public.Notifications"
pg_dump: dumping contents of table "public.Notifications"
-- Dependencies: 245
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notifications" (id, notification_type, notification_priority, ticket_id, title, message, action_url, created_by_user_id, is_global, target_user_id, target_role, requires_action, is_resolved, resolved_at, resolved_by_user_id, created_at, expires_at) FROM stdin;
13	0	1	26	Yeni Sorun Oluşturuldu	#AKF-2025-11-23: asdasd	/tickets/26	2	t	\N	\N	f	f	\N	\N	2025-11-25 00:16:00.180545+00	\N
14	1	1	26	İlerleme Raporu Talep Edildi	AKF-2025-11-23 numaralı sorun için ilerleme raporu bekleniyor	/tickets/26	2	f	2	\N	t	f	\N	\N	2025-11-25 00:16:05.449069+00	2025-12-02 00:16:05.449069+00
15	1	1	26	İlerleme Raporu Talep Edildi	AKF-2025-11-23 numaralı sorun için ilerleme raporu bekleniyor	/tickets/26	2	f	2	\N	t	f	\N	\N	2025-11-25 00:20:38.209793+00	2025-12-02 00:20:38.209793+00
16	1	1	4	İlerleme Raporu Talep Edildi	AKF-2025-11-1 numaralı sorun için ilerleme raporu bekleniyor	/tickets/4	2	f	1	\N	t	f	\N	\N	2025-11-25 00:20:44.251497+00	2025-12-02 00:20:44.251497+00
pg_dump: processing data for table "public.ProgressRequests"
17	0	1	27	Yeni Sorun Oluşturuldu	#AKF-2025-11-24: a yeni sorun	/tickets/27	1	t	\N	\N	f	f	\N	\N	2025-11-25 12:23:46.744553+00	\N
18	1	1	3	İlerleme Raporu Talep Edildi	TKT-2024-003 numaralı sorun için ilerleme raporu bekleniyor	/tickets/3	1	f	5	\N	t	f	\N	\N	2025-11-25 12:24:20.924664+00	2025-12-02 12:24:20.924664+00
19	1	1	27	İlerleme Raporu Talep Edildi	AKF-2025-11-24 numaralı sorun için ilerleme raporu bekleniyor	/tickets/27	1	f	1	\N	t	f	\N	\N	2025-11-25 12:24:41.042683+00	2025-12-02 12:24:41.042683+00
20	1	1	27	Bilgi Raporu Talep Edildi	AKF-2025-11-24 numaralı sorun için bilgi raporu bekleniyor	/tickets/27	1	t	1	\N	t	f	\N	\N	2025-11-26 00:07:21.851712+00	2025-12-03 00:07:21.851733+00
\.


--
-- TOC entry 3669 (class 0 OID 22380)
-- Dependencies: 251
-- Data for Name: ProgressRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProgressRequests" ("Id", ticket_id, requested_by_user_id, target_user_id, request_message, requested_at, due_date, is_responded, responded_at, responded_by_user_id, response_action_id, status, notification_id) FROM stdin;
pg_dump: dumping contents of table "public.ProgressRequests"
3	26	2	2	AKF-2025-11-23 numaralı sorun için ilerleme raporu bekleniyor	2025-11-25 00:16:05.44525+00	2025-12-02 00:16:05.44525+00	f	\N	\N	\N	Pending	14
4	26	2	2	AKF-2025-11-23 numaralı sorun için ilerleme raporu bekleniyor	2025-11-25 00:20:38.202824+00	2025-12-02 00:20:38.202824+00	f	\N	\N	\N	Pending	15
5	4	2	1	AKF-2025-11-1 numaralı sorun için ilerleme raporu bekleniyor	2025-11-25 00:20:44.247817+00	2025-12-02 00:20:44.247817+00	f	\N	\N	\N	Pending	16
6	3	1	5	TKT-2024-003 numaralı sorun için ilerleme raporu bekleniyor	2025-11-25 12:24:20.887027+00	2025-12-02 12:24:20.887105+00	f	\N	\N	\N	Pending	18
7	27	1	1	AKF-2025-11-24 numaralı sorun için ilerleme raporu bekleniyor	2025-11-25 12:24:41.033212+00	2025-12-02 12:24:41.033213+00	f	\N	\N	\N	Pending	19
8	27	1	1	AKF-2025-11-24 numaralı sorun için bilgi raporu bekleniyor	2025-11-26 00:07:21.720655+00	2025-12-03 00:07:21.720683+00	f	\N	\N	\N	Pending	20
\.


--
-- TOC entry 3643 (class 0 OID 22073)
-- Dependencies: 225
-- Data for Name: Subsystems; Type: TABLE DATA; Schema: public; Owner: postgrespg_dump: processing data for table "public.Subsystems"
pg_dump: dumping contents of table "public.Subsystems"
pg_dump: processing data for table "public.Systems"
pg_dump: dumping contents of table "public.Systems"
pg_dump: processing data for table "public.TicketActions"
pg_dump: dumping contents of table "public.TicketActions"

--

COPY public."Subsystems" ("Id", "Name", "SystemId") FROM stdin;
1	Payload	1
2	MGS	2
3	CMS	1
4	Genel	1
5	Platform	1
6	SAS	1
7	SASS	1
8	SUSS	1
9	USS	1
\.


--
-- TOC entry 3639 (class 0 OID 22042)
-- Dependencies: 221
-- Data for Name: Systems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Systems" ("Id", "Name") FROM stdin;
1	GGS
2	MGS
3	MTZ
\.


--
-- TOC entry 3656 (class 0 OID 22204)
-- Dependencies: 238
-- Data for Name: TicketActions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TicketActions" ("Id", "TicketId", "ActionType", "FromStatus", "ToStatus", "Notes", "PerformedById", "PerformedAt") FROM stdin;
1	1	Create	\N	OPEN	\N	1	2025-11-20 07:05:39.597135+00
2	2	Create	\N	OPEN	\N	5	2025-11-20 07:05:39.597551+00
3	3	Create	\N	OPEN	\N	5	2025-11-20 07:05:39.597551+00
4	1	Edit	\N	\N	Ticket updated	1	2025-11-20 09:21:50.483922+00
5	1	Edit	\N	\N	Ticket updated	1	2025-11-20 09:22:35.705251+00
6	1	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-20 09:25:59.352862+00
7	3	Edit	\N	\N	Ticket updated	1	2025-11-20 11:32:12.675539+00
8	4	Create	\N	OPEN	Ticket created	1	2025-11-20 11:43:31.486662+00
9	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:35:17.618358+00
10	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:35:33.860917+00
11	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:41:26.420589+00
12	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:41:37.413716+00
13	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:41:46.881145+00
14	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:42:47.923977+00
15	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:44:42.610483+00
16	4	Edit	\N	\N	Ticket updated	1	2025-11-20 19:45:21.463638+00
17	5	Create	\N	OPEN	Ticket created	1	2025-11-20 20:22:24.683948+00
18	5	Edit	\N	\N	Ticket updated	1	2025-11-20 21:46:15.248042+00
19	5	Edit	\N	\N	Ticket updated	1	2025-11-20 21:46:26.282539+00
20	5	Edit	\N	\N	Ticket updated	1	2025-11-20 21:46:53.004719+00
21	6	Create	\N	OPEN	Ticket created	1	2025-11-20 21:47:03.567595+00
22	5	StatusChange	OPEN	PAUSED	Status changed from OPEN to PAUSED	1	2025-11-20 22:19:25.881561+00
23	5	Edit	\N	\N	Ticket updated	1	2025-11-20 22:19:25.898847+00
24	5	StatusChange	PAUSED	REOPENED	Status changed from PAUSED to REOPENED	1	2025-11-20 22:19:35.385508+00
25	5	Edit	\N	\N	Ticket updated	1	2025-11-20 22:19:35.385649+00
26	5	StatusChange	REOPENED	CLOSED	Status changed from REOPENED to CLOSED	1	2025-11-20 22:19:48.785039+00
27	5	Edit	\N	\N	Ticket updated	1	2025-11-20 22:19:48.785154+00
28	6	StatusChange	OPEN	PAUSED	Status changed from OPEN to PAUSED	1	2025-11-20 22:51:19.308896+00
29	6	Edit	\N	\N	Ticket updated	1	2025-11-20 22:51:19.331421+00
30	6	StatusChange	PAUSED	CLOSED	Status changed from PAUSED to CLOSED	1	2025-11-20 22:51:26.142933+00
31	6	Edit	\N	\N	Ticket updated	1	2025-11-20 22:51:26.143113+00
32	7	Create	\N	OPEN	Ticket created	1	2025-11-20 23:03:07.321004+00
33	7	StatusChange	OPEN	PAUSED	Status changed from OPEN to PAUSED	1	2025-11-20 23:03:15.146248+00
34	7	Edit	\N	\N	Ticket updated	1	2025-11-20 23:03:15.148241+00
35	7	StatusChange	PAUSED	REOPENED	Status changed from PAUSED to REOPENED	1	2025-11-20 23:03:19.948152+00
36	7	Edit	\N	\N	Ticket updated	1	2025-11-20 23:03:19.948347+00
37	7	Edit	\N	\N	Ticket updated	1	2025-11-20 23:03:21.517046+00
38	6	StatusChange	CLOSED	REOPENED	Status changed from CLOSED to REOPENED	1	2025-11-20 23:35:07.558611+00
39	6	Edit	\N	\N	Ticket updated	1	2025-11-20 23:35:07.584041+00
40	6	StatusChange	REOPENED	PAUSED	Status changed from REOPENED to PAUSED	1	2025-11-20 23:35:11.086231+00
41	6	Edit	\N	\N	Ticket updated	1	2025-11-20 23:35:11.08646+00
42	6	StatusChange	PAUSED	REOPENED	Status changed from PAUSED to REOPENED	1	2025-11-20 23:35:14.464674+00
43	6	Edit	\N	\N	Ticket updated	1	2025-11-20 23:35:14.464866+00
44	7	StatusChange	REOPENED	PAUSED	Status changed from REOPENED to PAUSED	1	2025-11-20 23:36:48.769165+00
45	7	Edit	\N	\N	Ticket updated	1	2025-11-20 23:36:48.769282+00
46	7	StatusChange	PAUSED	REOPENED	Status changed from PAUSED to REOPENED	1	2025-11-20 23:36:52.234276+00
47	7	Edit	\N	\N	Ticket updated	1	2025-11-20 23:36:52.234413+00
48	7	StatusChange	REOPENED	PAUSED	Status changed from REOPENED to PAUSED	1	2025-11-21 00:29:14.220396+00
49	7	Edit	\N	\N	Ticket updated	1	2025-11-21 00:29:14.242963+00
50	7	StatusChange	PAUSED	REOPENED	Status changed from PAUSED to REOPENED	1	2025-11-21 00:29:19.05414+00
51	7	Edit	\N	\N	Ticket updated	1	2025-11-21 00:29:19.054255+00
52	7	StatusChange	REOPENED	PAUSED	Status changed from REOPENED to PAUSED	1	2025-11-21 00:29:22.517682+00
53	7	Edit	\N	\N	Ticket updated	1	2025-11-21 00:29:22.517851+00
54	7	Edit	\N	\N	Ticket updated	1	2025-11-22 09:09:37.148319+00
55	7	Edit	\N	\N	Ticket updated	1	2025-11-22 12:29:14.71786+00
56	7	Edit	\N	\N	Ticket updated	1	2025-11-23 00:34:55.756054+00
57	7	Edit	\N	\N	Ticket updated	1	2025-11-23 00:35:09.910251+00
58	7	Edit	\N	\N	Ticket updated	1	2025-11-23 00:40:16.717048+00
59	8	Create	\N	OPEN	Ticket created	2	2025-11-23 00:40:51.867171+00
60	9	Create	\N	OPEN	Ticket created	2	2025-11-23 00:41:25.747184+00
61	10	Create	\N	OPEN	Ticket created	2	2025-11-23 00:43:20.931981+00
62	11	Create	\N	OPEN	Ticket created	2	2025-11-23 00:51:24.548518+00
63	12	Create	\N	OPEN	Ticket created	2	2025-11-23 00:53:22.987785+00
64	13	Create	\N	OPEN	Ticket created	2	2025-11-23 01:01:29.705647+00
65	14	Create	\N	OPEN	Ticket created	2	2025-11-23 01:01:37.279481+00
66	15	Create	\N	OPEN	Ticket created	2	2025-11-23 14:27:51.915151+00
67	16	Create	\N	OPEN	Ticket created	2	2025-11-23 14:42:17.780843+00
68	17	Create	\N	OPEN	Ticket created	2	2025-11-23 14:42:23.654344+00
69	18	Create	\N	OPEN	Ticket created	2	2025-11-23 14:48:27.452247+00
70	19	Create	\N	OPEN	Ticket created	1	2025-11-23 15:05:14.268213+00
71	20	Create	\N	OPEN	Ticket created	1	2025-11-23 15:06:59.555668+00
72	21	Create	\N	OPEN	Ticket created	1	2025-11-23 15:08:42.361559+00
73	22	Create	\N	OPEN	Ticket created	1	2025-11-24 09:34:23.975082+00
74	23	Create	\N	OPEN	Ticket created	2	2025-11-24 23:27:03.998174+00
75	20	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.118302+00
76	21	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.123754+00
78	22	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.123311+00
77	18	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.117698+00
79	19	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.117695+00
80	23	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.123757+00
84	14	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.169589+00
81	17	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.170473+00
83	15	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.169591+00
85	12	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.171147+00
82	16	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.169591+00
86	13	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.170698+00
91	23	Edit	\N	\N	Ticket restored (undelete)	1	2025-11-24 23:38:43.956285+00
87	11	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.181409+00
88	9	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.184765+00
89	10	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.184764+00
90	8	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:36:34.185413+00
92	7	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:39:13.660561+00
pg_dump: processing data for table "public.TicketComments"
pg_dump: dumping contents of table "public.TicketComments"
pg_dump: processing data for table "public.UserPermissions"
93	6	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:39:13.660563+00
94	23	Edit	\N	\N	Ticket deleted (soft delete)	1	2025-11-24 23:39:20.884629+00
95	24	Create	\N	OPEN	Ticket created	1	2025-11-24 23:39:31.602719+00
96	25	Create	\N	OPEN	Ticket created	1	2025-11-24 23:56:06.641504+00
97	26	Create	\N	OPEN	Ticket created	2	2025-11-25 00:16:00.106051+00
98	26	Edit	\N	\N	Ticket updated	2	2025-11-25 00:16:25.814521+00
99	27	Create	\N	OPEN	Ticket created	1	2025-11-25 12:23:46.644793+00
\.


--
-- TOC entry 3658 (class 0 OID 22222)
-- Dependencies: 240
-- Data for Name: TicketComments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TicketComments" ("Id", "TicketId", "Body", "CreatedById", "CreatedAt") FROM stdin;
\.


--
-- TOC entry 3645 (class 0 OID 22086)
-- Dependencies: 227
-- Data for Name: UserPermissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserPermissions" ("Id", "UserId", "PermissionType", "CanView", "CanCreate", "CanEdit", "CanDelete", "GrantedAt", "GrantedById") FROM stdin;
pg_dump: dumping contents of table "public.UserPermissions"
pg_dump: processing data for table "public.__EFMigrationsHistory"
pg_dump: dumping contents of table "public.__EFMigrationsHistory"
\.


--
-- TOC entry 3633 (class 0 OID 22000)
-- Dependencies: 215
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20251106083941_InitialSchema	8.0.0
20251109125431_ResponsePersonnelJoinFix	8.0.0
20251109135525_AddActivityControlFieldsToTicket	8.0.0
20251111130838_ResponsePersonnelJoinFix3	8.0.0
20251112055709_ttcoms_code	8.0.0
20251112131232_response_resolved_by	8.0.0
20251120070510_external_rm_ticket_code	8.0.0
20251120131525_external_add_configuration	8.0.0
20251120192216_external_add_new_items_columns	8.0.0
20251120204319_external_add_new_activity_status_columns	8.0.0
20251113112827_InitialSchema_pc_relocation	8.0.0
20251114051322_InitialSchema2	8.0.0
20251121114520_subcontractor_columns	8.0.0
20251123132157_notification	8.0.0
20251124235015_progress_request	8.0.0
20251125193731_position_to_user	8.0.0
\.


--
-- TOC entry 3661 (class 0 OID 22294)
-- Dependencies: 243
-- Data for Name: configuration; Type: TABLE DATA; Schema: public; Owner: postgrespg_dump: processing data for table "public.configuration"
pg_dump: dumping contents of table "public.configuration"
pg_dump: processing data for table "public.ticket"

--

COPY public.configuration (id, expiration_date, pdfreport_date, is_active, created_date, updated_date, updated_by_id) FROM stdin;
1	\N	2025-11-21 00:56:00+00	t	2025-11-20 13:18:42.89526+00	2025-11-21 00:56:56.795676+00	1
\.


--
-- TOC entry 3649 (class 0 OID 22115)
-- Dependencies: 231
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket (id, external_code, title, description, is_blocking, status, confirmation_status, technical_report_required, ci_id, component_id, subsystem_id, system_id, item_description, item_id, item_serial_no, created_at, updated_at, reaction_date, resolution_date, created_by_id, last_updated_by_id, is_active, is_deleted, detected_date, detected_contractor_notified_at, detected_notification_methods, detected_by_user_id, response_date, response_resolved_at, activity_control_commander_id, activity_control_date, activity_control_personnel_id, activity_control_result, response_actions, ttcoms_code, response_resolved_by_user_id, hp_no, new_item_description, new_item_id, new_item_serial_no, tentative_solution_date, activity_control_status, sub_contractor, sub_contractor_notified_at) FROM stdin;
pg_dump: dumping contents of table "public.ticket"
2	TKT-2024-002	Network Connectivity Issue	Users in Building A cannot access the network	f	OPEN	\N	f	\N	\N	\N	\N	\N	\N	\N	2025-11-20 07:05:39.597551+00	2025-11-20 07:05:39.597551+00	\N	\N	5	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1	T003198	Sample Ticket 1	This is a sample ticket.	f	OPEN	\N	f	1	1	1	1				2025-11-20 07:05:39.597135+00	2025-11-20 09:25:59.352837+00	\N	\N	1	1	f	t	\N	\N	{}	\N	\N	\N	\N	\N	\N				\N	\N	\N	\N	\N	\N	\N	\N	\N
3	TKT-2024-003	Server Hardware Failure	Production server showing hardware errors	t	OPEN	\N	t	1	1	1	1				2025-11-20 07:05:39.597551+00	2025-11-20 11:32:12.67529+00	\N	\N	5	1	t	f	\N	\N	{}	\N	\N	\N	\N	\N	\N				\N	\N	\N	\N	\N	\N	\N	\N	\N
4	AKF-2025-11-1	a	a	f	OPEN	\N	t	\N	\N	\N	\N	old_1	old_2	old_3	2025-11-20 11:43:31.484315+00	2025-11-20 19:45:21.463637+00	\N	\N	1	1	t	f	\N	\N	{}	3	\N	\N	\N	\N	\N				\N	hp no	new_1	new_2	new_3	2025-11-04 19:42:00+00	\N	\N	\N
21	AKF-2025-11-18	aaaaaaaa 222222		f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 15:08:42.269386+00	2025-11-24 23:36:34.123743+00	\N	\N	1	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
20	AKF-2025-11-17	a1		f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 15:06:59.420652+00	2025-11-24 23:36:34.118295+00	\N	\N	1	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
18	AKF-2025-11-15	a not	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 14:48:27.367628+00	2025-11-24 23:36:34.117233+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
5	AKF-2025-11-2	a	a	f	CLOSED	\N	f	\N	\N	\N	\N				2025-11-20 20:22:24.662883+00	2025-11-20 22:19:48.785154+00	\N	\N	1	1	t	f	\N	\N	{}	\N	\N	\N	\N	\N	\N				\N	\N	\N	\N	\N	\N	2	\N	\N
19	AKF-2025-11-16	a1		f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 15:05:14.267389+00	2025-11-24 23:36:34.117235+00	\N	\N	1	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
22	AKF-2025-11-19	aasda	asdasdasd	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-24 09:34:23.974235+00	2025-11-24 23:36:34.123291+00	\N	\N	1	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
14	AKF-2025-11-11	b	b	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 01:01:37.27874+00	2025-11-24 23:36:34.169559+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
17	AKF-2025-11-14	y not	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 14:42:23.652931+00	2025-11-24 23:36:34.170463+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
15	AKF-2025-11-12	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 14:27:51.834123+00	2025-11-24 23:36:34.169559+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
16	AKF-2025-11-13	y not	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 14:42:17.700189+00	2025-11-24 23:36:34.169559+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
12	AKF-2025-11-9	asdasd	asdasd	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 00:53:22.986985+00	2025-11-24 23:36:34.170461+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
13	AKF-2025-11-10	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 01:01:29.625862+00	2025-11-24 23:36:34.170458+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
11	AKF-2025-11-8	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 00:51:24.527137+00	2025-11-24 23:36:34.18139+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
10	AKF-2025-11-7	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 00:43:20.838277+00	2025-11-24 23:36:34.184751+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
9	AKF-2025-11-6	a	b	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 00:41:25.74695+00	2025-11-24 23:36:34.184751+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
8	AKF-2025-11-5	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-23 00:40:51.864468+00	2025-11-24 23:36:34.185406+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
7	AKF-2025-11-4	a	a	f	PAUSED	\N	t	\N	\N	\N	\N				2025-11-20 23:03:07.297112+00	2025-11-24 23:39:13.660203+00	\N	\N	1	1	f	t	\N	\N	{}	1	\N	\N	\N	\N	\N				\N					\N	5	\N	\N
6	AKF-2025-11-3	a	a	f	REOPENED	\N	t	\N	\N	\N	\N				2025-11-20 21:47:03.565297+00	2025-11-24 23:39:13.660233+00	\N	\N	1	1	f	t	\N	\N	{}	\N	\N	\N	\N	\N	\N				\N					\N	0	\N	\N
23	AKF-2025-11-20	asdasd	asdasd	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-24 23:27:03.987805+00	2025-11-24 23:39:20.884608+00	\N	\N	2	1	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
pg_dump: processing data for table "public.ticket_response_personnel"
pg_dump: dumping contents of table "public.ticket_response_personnel"
24	AKF-2025-11-21	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-24 23:39:31.600284+00	2025-11-24 23:39:31.600309+00	\N	\N	1	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
25	AKF-2025-11-22	a	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-24 23:56:06.55429+00	2025-11-24 23:56:06.554315+00	\N	\N	1	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
26	AKF-2025-11-23	asdasd	asd	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-25 00:16:00.104574+00	2025-11-25 00:16:25.814464+00	\N	\N	2	2	t	f	\N	\N	{}	\N	\N	\N	\N	\N	\N				\N					\N	0		\N
27	AKF-2025-11-24	a yeni sorun	a	f	OPEN	\N	f	\N	\N	\N	\N				2025-11-25 12:23:46.625239+00	2025-11-25 12:23:46.6253+00	\N	\N	1	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N				\N					\N	\N		\N
\.


--
-- TOC entry 3654 (class 0 OID 22188)
-- Dependencies: 236
-- Data for Name: ticket_response_personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_response_personnel (ticket_id, user_id) FROM stdin;
1	5
1	6
1	7
2	5
3	5
\.


--
-- TOC entry 3659 (class 0 OID 22276)
-- Dependencies: 241
-- Data for Name: ticket_response_resolved_personnel; Type: TABLE DATA; Schema: public; Owner: postgrespg_dump: processing data for table "public.ticket_response_resolved_personnel"
pg_dump: dumping contents of table "public.ticket_response_resolved_personnel"
pg_dump: processing data for table "public.user"
pg_dump: dumping contents of table "public.user"

--

COPY public.ticket_response_resolved_personnel (ticket_id, user_id) FROM stdin;
1	8
3	4
7	1
\.


--
-- TOC entry 3641 (class 0 OID 22050)
-- Dependencies: 223
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password_hash, display_name, role, created_at, updated_at, is_active, phone_number, affiliation, department, military_rank_id, rank_code, preferred_language, created_by_id, last_updated_by_id, "position") FROM stdin;
6	personnel2@example.com	AQAAAAIAAYagAAAAEBiDS481voEkXEQHSLBG/NLOFZcSs0huokZe61OTkE6S4xa84A2r/RxY4SpVJvKrTA==	Ayşe Demir	2	2025-11-20 07:05:39.180804+00	2025-11-20 07:05:39.180804+00	t	\N	\N	\N	\N	\N	tr-TR	1	\N	\N
7	personnel3@example.com	AQAAAAIAAYagAAAAELe3EUbZuoFYZJiNRMMOoQnPAsQLuA6nimjRQ8Z7mgPH+3IIAl6M664zdTYoT8p20w==	Mehmet Kaya	1	2025-11-20 07:05:39.241929+00	2025-11-20 07:05:39.241929+00	t	\N	\N	\N	\N	\N	tr-TR	1	\N	\N
9	kenan@example.com	AQAAAAIAAYagAAAAEEVsz9tA4CMSdkta7IJ3lpIVrPUd/GF36IsEi3AngPA0kv+/T4G5O5JDO7E50j8NSA==	kenan	1	2025-11-20 07:05:39.358614+00	2025-11-20 07:05:39.358614+00	t		9		7	\N	tr-TR	1	\N	\N
8	Ali@example.com	AQAAAAIAAYagAAAAEBQ6sLYMRAd/uhaCElXhfrWkhlgi1Q9Gd5TL7pbnAE7XNlnkwikKXAI5oL8Rc8hMJQ==	ali veli	0	2025-11-20 07:05:39.300663+00	2025-11-20 09:24:18.375832+00	t		9		1	\N	tr-TR	1	1	\N
1	admin@example.com	AQAAAAIAAYagAAAAEL1kWDqqeYoXr9Wx1kse7YAXeR6/bv8L3HvZQcNOnaMqPNdjD0o0ynmg0djGqbNe8w==	Administrator	2	2025-11-20 07:05:38.883053+00	2025-11-22 22:46:02.720254+00	t	\N	1	\N	13	\N	tr-TR	\N	1	\N
3	viewer@example.com	AQAAAAIAAYagAAAAECRZKnJhgqUEpTSvqKlSVkfzqyJhhraE/rF11tVS+CxRCHojNwHuSRGl9v6yHStoJg==	Viewer User	0	2025-11-20 07:05:39.000109+00	2025-11-25 12:16:00.543027+00	t	\N	9	KJ	\N	\N	tr-TR	\N	3	\N
4	kenan23@gmail.com	AQAAAAIAAYagAAAAEBfHyeIag7ZqChlfXRIZiUjbv5GCKsrZhRaqCXlThJmXU9nhen3P13J2yBF5WInF/A==	Kenan BOLAT	1	2025-11-20 07:05:39.060663+00	2025-11-20 11:43:00.275845+00	t	+90	9	IPS	\N	\N	tr-TR	1	1	\N
10	kenan24@gmail.com	AQAAAAIAAYagAAAAEIcdykpwaEtk2aSjNP9gI7i60rRV9Id2xIIx6Jv6gd3HkCdCOADVXxKcMrnhDhHfYA==	k b	1	2025-11-25 22:21:16.930601+00	2025-11-25 22:40:11.059147+00	t		1	a	1	\N	tr-TR	1	1	2
pg_dump: executing SEQUENCE SET Attachments_Id_seq
pg_dump: executing SEQUENCE SET CIJobs_Id_seq
5	personnel1@example.com	AQAAAAIAAYagAAAAEAQWolj/N1/X4/Nt85qwPvPJ9kbdhb2b3xVVFzPq8yfabJ0rr6RfAYXsxipy983wKA==	Ali Veli	1	2025-11-20 07:05:39.120475+00	2025-11-20 13:19:47.899205+00	t	\N	\N	\N	\N	\N	tr-TR	1	1	\N
2	editor@example.com	AQAAAAIAAYagAAAAEPcDuo0GY7TBNhgPfx1BRAhbZHqZAi4VxzLX1Q7z2Om9jvw01XrWdg/mtS77A4ZSPg==	Editor User	1	2025-11-20 07:05:38.942416+00	2025-11-21 00:56:26.467631+00	t	\N	\N	\N	\N	\N	tr-TR	\N	1	\N
11	kenan25@gmail.com	AQAAAAIAAYagAAAAEAbFgYoO6+kWHGQ39hFiHxPIXDRSD70o+L8USop7XTipWuWwb7IK9mcepeNXjF4yXw==	k b	0	2025-11-25 22:40:46.205568+00	2025-11-25 22:41:22.103864+00	t		0	a	\N	\N	tr-TR	1	1	3
\.


--
-- TOC entry 3676 (class 0 OID 0)
-- Dependencies: 232
-- Name: Attachments_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Attachments_Id_seq"', 1, false);


--
-- TOC entry 3677 (class 0 OID 0)
-- Dependencies: 234
-- Name: CIJobs_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CIJobs_Id_seq"', 1, false);


pg_dump: executing SEQUENCE SET Components_Id_seq
pg_dump: executing SEQUENCE SET ConfigurationItems_Id_seq
pg_dump: executing SEQUENCE SET MilitaryRanks_Id_seq
pg_dump: executing SEQUENCE SET NotificationActions_Id_seq
pg_dump: executing SEQUENCE SET NotificationReads_Id_seq
--
-- TOC entry 3678 (class 0 OID 0)
-- Dependencies: 228
-- Name: Components_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Components_Id_seq"', 3, true);


--
-- TOC entry 3679 (class 0 OID 0)
-- Dependencies: 216
-- Name: ConfigurationItems_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ConfigurationItems_Id_seq"', 25, true);


--
-- TOC entry 3680 (class 0 OID 0)
-- Dependencies: 218
-- Name: MilitaryRanks_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MilitaryRanks_Id_seq"', 18, true);


--
-- TOC entry 3681 (class 0 OID 0)
-- Dependencies: 246
-- Name: NotificationActions_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."NotificationActions_Id_seq"', 1, false);


--
-- TOC entry 3682 (class 0 OID 0)
-- Dependencies: 248
-- Name: NotificationReads_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

pg_dump: executing SEQUENCE SET Notifications_id_seq
pg_dump: executing SEQUENCE SET ProgressRequests_Id_seq
pg_dump: executing SEQUENCE SET Subsystems_Id_seq
pg_dump: executing SEQUENCE SET Systems_Id_seq
pg_dump: executing SEQUENCE SET TicketActions_Id_seq
SELECT pg_catalog.setval('public."NotificationReads_Id_seq"', 22, true);


--
-- TOC entry 3683 (class 0 OID 0)
-- Dependencies: 244
-- Name: Notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notifications_id_seq"', 20, true);


--
-- TOC entry 3684 (class 0 OID 0)
-- Dependencies: 250
-- Name: ProgressRequests_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProgressRequests_Id_seq"', 8, true);


--
-- TOC entry 3685 (class 0 OID 0)
-- Dependencies: 224
-- Name: Subsystems_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Subsystems_Id_seq"', 9, true);


--
-- TOC entry 3686 (class 0 OID 0)
-- Dependencies: 220
-- Name: Systems_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Systems_Id_seq"', 3, true);


--
-- TOC entry 3687 (class 0 OID 0)
-- Dependencies: 237
-- Name: TicketActions_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgrespg_dump: executing SEQUENCE SET TicketComments_Id_seq
pg_dump: executing SEQUENCE SET UserPermissions_Id_seq
pg_dump: executing SEQUENCE SET configuration_id_seq
pg_dump: executing SEQUENCE SET ticket_id_seq
pg_dump: executing SEQUENCE SET user_id_seq

--

SELECT pg_catalog.setval('public."TicketActions_Id_seq"', 99, true);


--
-- TOC entry 3688 (class 0 OID 0)
-- Dependencies: 239
-- Name: TicketComments_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TicketComments_Id_seq"', 1, false);


--
-- TOC entry 3689 (class 0 OID 0)
-- Dependencies: 226
-- Name: UserPermissions_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserPermissions_Id_seq"', 1, false);


--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 242
-- Name: configuration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuration_id_seq', 1, true);


--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 230
-- Name: ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_id_seq', 27, true);


--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 222
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgrespg_dump: creating CONSTRAINT "public.Attachments PK_Attachments"
pg_dump: creating CONSTRAINT "public.CIJobs PK_CIJobs"
pg_dump: creating CONSTRAINT "public.Components PK_Components"
pg_dump: creating CONSTRAINT "public.ConfigurationItems PK_ConfigurationItems"
pg_dump: creating CONSTRAINT "public.MilitaryRanks PK_MilitaryRanks"

--

SELECT pg_catalog.setval('public.user_id_seq', 11, true);


--
-- TOC entry 3402 (class 2606 OID 22164)
-- Name: Attachments PK_Attachments; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachments"
    ADD CONSTRAINT "PK_Attachments" PRIMARY KEY ("Id");


--
-- TOC entry 3405 (class 2606 OID 22182)
-- Name: CIJobs PK_CIJobs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CIJobs"
    ADD CONSTRAINT "PK_CIJobs" PRIMARY KEY ("Id");


--
-- TOC entry 3386 (class 2606 OID 22108)
-- Name: Components PK_Components; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Components"
    ADD CONSTRAINT "PK_Components" PRIMARY KEY ("Id");


--
-- TOC entry 3365 (class 2606 OID 22032)
-- Name: ConfigurationItems PK_ConfigurationItems; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ConfigurationItems"
    ADD CONSTRAINT "PK_ConfigurationItems" PRIMARY KEY ("Id");


--
-- TOC entry 3368 (class 2606 OID 22040)
pg_dump: creating CONSTRAINT "public.NotificationActions PK_NotificationActions"
pg_dump: creating CONSTRAINT "public.NotificationReads PK_NotificationReads"
pg_dump: creating CONSTRAINT "public.Notifications PK_Notifications"
pg_dump: creating CONSTRAINT "public.ProgressRequests PK_ProgressRequests"
-- Name: MilitaryRanks PK_MilitaryRanks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MilitaryRanks"
    ADD CONSTRAINT "PK_MilitaryRanks" PRIMARY KEY ("Id");


--
-- TOC entry 3434 (class 2606 OID 22340)
-- Name: NotificationActions PK_NotificationActions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationActions"
    ADD CONSTRAINT "PK_NotificationActions" PRIMARY KEY ("Id");


--
-- TOC entry 3438 (class 2606 OID 22358)
-- Name: NotificationReads PK_NotificationReads; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationReads"
    ADD CONSTRAINT "PK_NotificationReads" PRIMARY KEY ("Id");


--
-- TOC entry 3430 (class 2606 OID 22312)
-- Name: Notifications PK_Notifications; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "PK_Notifications" PRIMARY KEY (id);


--
-- TOC entry 3447 (class 2606 OID 22386)
-- Name: ProgressRequests PK_ProgressRequests; Type: CONSTRAINT; Schema: public; Owner: postgrespg_dump: creating CONSTRAINT "public.Subsystems PK_Subsystems"
pg_dump: creating CONSTRAINT "public.Systems PK_Systems"
pg_dump: creating CONSTRAINT "public.TicketActions PK_TicketActions"
pg_dump: creating CONSTRAINT "public.TicketComments PK_TicketComments"

--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "PK_ProgressRequests" PRIMARY KEY ("Id");


--
-- TOC entry 3379 (class 2606 OID 22079)
-- Name: Subsystems PK_Subsystems; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subsystems"
    ADD CONSTRAINT "PK_Subsystems" PRIMARY KEY ("Id");


--
-- TOC entry 3370 (class 2606 OID 22048)
-- Name: Systems PK_Systems; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Systems"
    ADD CONSTRAINT "PK_Systems" PRIMARY KEY ("Id");


--
-- TOC entry 3412 (class 2606 OID 22210)
-- Name: TicketActions PK_TicketActions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TicketActions"
    ADD CONSTRAINT "PK_TicketActions" PRIMARY KEY ("Id");


--
-- TOC entry 3416 (class 2606 OID 22228)
-- Name: TicketComments PK_TicketComments; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TicketComments"
    ADD CONSTRAINT "PK_TicketComments" PRIMARY KEY ("Id");


pg_dump: creating CONSTRAINT "public.UserPermissions PK_UserPermissions"
pg_dump: creating CONSTRAINT "public.__EFMigrationsHistory PK___EFMigrationsHistory"
pg_dump: creating CONSTRAINT "public.configuration PK_configuration"
pg_dump: creating CONSTRAINT "public.ticket PK_ticket"
pg_dump: creating CONSTRAINT "public.ticket_response_personnel PK_ticket_response_personnel"
--
-- TOC entry 3383 (class 2606 OID 22090)
-- Name: UserPermissions PK_UserPermissions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPermissions"
    ADD CONSTRAINT "PK_UserPermissions" PRIMARY KEY ("Id");


--
-- TOC entry 3363 (class 2606 OID 22004)
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- TOC entry 3422 (class 2606 OID 22298)
-- Name: configuration PK_configuration; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT "PK_configuration" PRIMARY KEY (id);


--
-- TOC entry 3398 (class 2606 OID 22121)
-- Name: ticket PK_ticket; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "PK_ticket" PRIMARY KEY (id);


--
-- TOC entry 3408 (class 2606 OID 22192)
-- Name: ticket_response_personnel PK_ticket_response_personnel; Type: CONSTRAINT; Schema: public; Owner: postgrespg_dump: creating CONSTRAINT "public.ticket_response_resolved_personnel PK_ticket_response_resolved_personnel"
pg_dump: creating CONSTRAINT "public.user PK_user"
pg_dump: creating INDEX "public.IX_Attachments_TicketId"
pg_dump: creating INDEX "public.IX_Attachments_UploadedById"

--

ALTER TABLE ONLY public.ticket_response_personnel
    ADD CONSTRAINT "PK_ticket_response_personnel" PRIMARY KEY (ticket_id, user_id);


--
-- TOC entry 3419 (class 2606 OID 22280)
-- Name: ticket_response_resolved_personnel PK_ticket_response_resolved_personnel; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_response_resolved_personnel
    ADD CONSTRAINT "PK_ticket_response_resolved_personnel" PRIMARY KEY (ticket_id, user_id);


--
-- TOC entry 3376 (class 2606 OID 22056)
-- Name: user PK_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_user" PRIMARY KEY (id);


--
-- TOC entry 3399 (class 1259 OID 22239)
-- Name: IX_Attachments_TicketId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Attachments_TicketId" ON public."Attachments" USING btree ("TicketId");


--
-- TOC entry 3400 (class 1259 OID 22240)
-- Name: IX_Attachments_UploadedById; Type: INDEX; Schema: public; Owner: postgres
--

pg_dump: creating INDEX "public.IX_CIJobs_TicketId"
pg_dump: creating INDEX "public.IX_Components_SubsystemId"
pg_dump: creating INDEX "public.IX_MilitaryRanks_Code"
pg_dump: creating INDEX "public.IX_NotificationActions_NotificationId"
pg_dump: creating INDEX "public.IX_NotificationActions_UserId"
CREATE INDEX "IX_Attachments_UploadedById" ON public."Attachments" USING btree ("UploadedById");


--
-- TOC entry 3403 (class 1259 OID 22241)
-- Name: IX_CIJobs_TicketId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_CIJobs_TicketId" ON public."CIJobs" USING btree ("TicketId");


--
-- TOC entry 3384 (class 1259 OID 22242)
-- Name: IX_Components_SubsystemId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Components_SubsystemId" ON public."Components" USING btree ("SubsystemId");


--
-- TOC entry 3366 (class 1259 OID 22243)
-- Name: IX_MilitaryRanks_Code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_MilitaryRanks_Code" ON public."MilitaryRanks" USING btree ("Code");


--
-- TOC entry 3431 (class 1259 OID 22369)
-- Name: IX_NotificationActions_NotificationId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_NotificationActions_NotificationId" ON public."NotificationActions" USING btree ("NotificationId");


--
-- TOC entry 3432 (class 1259 OID 22370)
pg_dump: creating INDEX "public.IX_NotificationReads_NotificationId_UserId"
pg_dump: creating INDEX "public.IX_NotificationReads_UserId"
pg_dump: creating INDEX "public.IX_Notifications_created_at"
pg_dump: creating INDEX "public.IX_Notifications_created_by_user_id"
-- Name: IX_NotificationActions_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_NotificationActions_UserId" ON public."NotificationActions" USING btree ("UserId");


--
-- TOC entry 3435 (class 1259 OID 22371)
-- Name: IX_NotificationReads_NotificationId_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_NotificationReads_NotificationId_UserId" ON public."NotificationReads" USING btree ("NotificationId", "UserId");


--
-- TOC entry 3436 (class 1259 OID 22372)
-- Name: IX_NotificationReads_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_NotificationReads_UserId" ON public."NotificationReads" USING btree ("UserId");


--
-- TOC entry 3423 (class 1259 OID 22373)
-- Name: IX_Notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_created_at" ON public."Notifications" USING btree (created_at);


--
-- TOC entry 3424 (class 1259 OID 22374)
-- Name: IX_Notifications_created_by_user_id; Type: INDEX; Schema: public; Owner: postgrespg_dump: creating INDEX "public.IX_Notifications_notification_type_is_resolved"
pg_dump: creating INDEX "public.IX_Notifications_resolved_by_user_id"
pg_dump: creating INDEX "public.IX_Notifications_target_user_id"
pg_dump: creating INDEX "public.IX_Notifications_ticket_id"

--

CREATE INDEX "IX_Notifications_created_by_user_id" ON public."Notifications" USING btree (created_by_user_id);


--
-- TOC entry 3425 (class 1259 OID 22375)
-- Name: IX_Notifications_notification_type_is_resolved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_notification_type_is_resolved" ON public."Notifications" USING btree (notification_type, is_resolved);


--
-- TOC entry 3426 (class 1259 OID 22376)
-- Name: IX_Notifications_resolved_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_resolved_by_user_id" ON public."Notifications" USING btree (resolved_by_user_id);


--
-- TOC entry 3427 (class 1259 OID 22377)
-- Name: IX_Notifications_target_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_target_user_id" ON public."Notifications" USING btree (target_user_id);


--
-- TOC entry 3428 (class 1259 OID 22378)
-- Name: IX_Notifications_ticket_id; Type: INDEX; Schema: public; Owner: postgres
pg_dump: creating INDEX "public.IX_ProgressRequests_notification_id"
pg_dump: creating INDEX "public.IX_ProgressRequests_requested_by_user_id"
pg_dump: creating INDEX "public.IX_ProgressRequests_responded_by_user_id"
pg_dump: creating INDEX "public.IX_ProgressRequests_response_action_id"
--

CREATE INDEX "IX_Notifications_ticket_id" ON public."Notifications" USING btree (ticket_id);


--
-- TOC entry 3439 (class 1259 OID 22417)
-- Name: IX_ProgressRequests_notification_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ProgressRequests_notification_id" ON public."ProgressRequests" USING btree (notification_id);


--
-- TOC entry 3440 (class 1259 OID 22418)
-- Name: IX_ProgressRequests_requested_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ProgressRequests_requested_by_user_id" ON public."ProgressRequests" USING btree (requested_by_user_id);


--
-- TOC entry 3441 (class 1259 OID 22419)
-- Name: IX_ProgressRequests_responded_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ProgressRequests_responded_by_user_id" ON public."ProgressRequests" USING btree (responded_by_user_id);


--
-- TOC entry 3442 (class 1259 OID 22420)
-- Name: IX_ProgressRequests_response_action_id; Type: INDEX; Schema: public; Owner: postgres
--

pg_dump: creating INDEX "public.IX_ProgressRequests_status"
pg_dump: creating INDEX "public.IX_ProgressRequests_target_user_id"
pg_dump: creating INDEX "public.IX_ProgressRequests_ticket_id"
pg_dump: creating INDEX "public.IX_Subsystems_SystemId"
CREATE INDEX "IX_ProgressRequests_response_action_id" ON public."ProgressRequests" USING btree (response_action_id);


--
-- TOC entry 3443 (class 1259 OID 22421)
-- Name: IX_ProgressRequests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ProgressRequests_status" ON public."ProgressRequests" USING btree (status);


--
-- TOC entry 3444 (class 1259 OID 22422)
-- Name: IX_ProgressRequests_target_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ProgressRequests_target_user_id" ON public."ProgressRequests" USING btree (target_user_id);


--
-- TOC entry 3445 (class 1259 OID 22423)
-- Name: IX_ProgressRequests_ticket_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ProgressRequests_ticket_id" ON public."ProgressRequests" USING btree (ticket_id);


--
-- TOC entry 3377 (class 1259 OID 22244)
-- Name: IX_Subsystems_SystemId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Subsystems_SystemId" ON public."Subsystems" USING btree ("SystemId");


pg_dump: creating INDEX "public.IX_TicketActions_PerformedById"
pg_dump: creating INDEX "public.IX_TicketActions_TicketId"
pg_dump: creating INDEX "public.IX_TicketComments_CreatedById"
pg_dump: creating INDEX "public.IX_TicketComments_TicketId"
pg_dump: creating INDEX "public.IX_UserPermissions_GrantedById"
--
-- TOC entry 3409 (class 1259 OID 22254)
-- Name: IX_TicketActions_PerformedById; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_TicketActions_PerformedById" ON public."TicketActions" USING btree ("PerformedById");


--
-- TOC entry 3410 (class 1259 OID 22255)
-- Name: IX_TicketActions_TicketId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_TicketActions_TicketId" ON public."TicketActions" USING btree ("TicketId");


--
-- TOC entry 3413 (class 1259 OID 22256)
-- Name: IX_TicketComments_CreatedById; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_TicketComments_CreatedById" ON public."TicketComments" USING btree ("CreatedById");


--
-- TOC entry 3414 (class 1259 OID 22257)
-- Name: IX_TicketComments_TicketId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_TicketComments_TicketId" ON public."TicketComments" USING btree ("TicketId");


--
-- TOC entry 3380 (class 1259 OID 22262)
-- Name: IX_UserPermissions_GrantedById; Type: INDEX; Schema: public; Owner: postgrespg_dump: creating INDEX "public.IX_UserPermissions_UserId_PermissionType"
pg_dump: creating INDEX "public.IX_configuration_updated_by_id"
pg_dump: creating INDEX "public.IX_ticket_activity_control_commander_id"
pg_dump: creating INDEX "public.IX_ticket_activity_control_personnel_id"

--

CREATE INDEX "IX_UserPermissions_GrantedById" ON public."UserPermissions" USING btree ("GrantedById");


--
-- TOC entry 3381 (class 1259 OID 22263)
-- Name: IX_UserPermissions_UserId_PermissionType; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_UserPermissions_UserId_PermissionType" ON public."UserPermissions" USING btree ("UserId", "PermissionType");


--
-- TOC entry 3420 (class 1259 OID 22304)
-- Name: IX_configuration_updated_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_configuration_updated_by_id" ON public.configuration USING btree (updated_by_id);


--
-- TOC entry 3387 (class 1259 OID 22264)
-- Name: IX_ticket_activity_control_commander_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_activity_control_commander_id" ON public.ticket USING btree (activity_control_commander_id);


--
-- TOC entry 3388 (class 1259 OID 22265)
-- Name: IX_ticket_activity_control_personnel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_activity_control_personnel_id" ON public.ticket USING btree (activity_control_personnel_id);


pg_dump: creating INDEX "public.IX_ticket_ci_id"
pg_dump: creating INDEX "public.IX_ticket_component_id"
pg_dump: creating INDEX "public.IX_ticket_created_by_id"
pg_dump: creating INDEX "public.IX_ticket_detected_by_user_id"
pg_dump: creating INDEX "public.IX_ticket_external_code"
--
-- TOC entry 3389 (class 1259 OID 22245)
-- Name: IX_ticket_ci_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_ci_id" ON public.ticket USING btree (ci_id);


--
-- TOC entry 3390 (class 1259 OID 22246)
-- Name: IX_ticket_component_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_component_id" ON public.ticket USING btree (component_id);


--
-- TOC entry 3391 (class 1259 OID 22247)
-- Name: IX_ticket_created_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_created_by_id" ON public.ticket USING btree (created_by_id);


--
-- TOC entry 3392 (class 1259 OID 22248)
-- Name: IX_ticket_detected_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_detected_by_user_id" ON public.ticket USING btree (detected_by_user_id);


--
-- TOC entry 3393 (class 1259 OID 22249)
-- Name: IX_ticket_external_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_ticket_external_code" ON public.ticket USING btree (external_code);


pg_dump: creating INDEX "public.IX_ticket_last_updated_by_id"
pg_dump: creating INDEX "public.IX_ticket_response_personnel_user_id"
pg_dump: creating INDEX "public.IX_ticket_response_resolved_personnel_user_id"
pg_dump: creating INDEX "public.IX_ticket_subsystem_id"
pg_dump: creating INDEX "public.IX_ticket_system_id"
--
-- TOC entry 3394 (class 1259 OID 22250)
-- Name: IX_ticket_last_updated_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_last_updated_by_id" ON public.ticket USING btree (last_updated_by_id);


--
-- TOC entry 3406 (class 1259 OID 22253)
-- Name: IX_ticket_response_personnel_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_response_personnel_user_id" ON public.ticket_response_personnel USING btree (user_id);


--
-- TOC entry 3417 (class 1259 OID 22291)
-- Name: IX_ticket_response_resolved_personnel_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_response_resolved_personnel_user_id" ON public.ticket_response_resolved_personnel USING btree (user_id);


--
-- TOC entry 3395 (class 1259 OID 22251)
-- Name: IX_ticket_subsystem_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ticket_subsystem_id" ON public.ticket USING btree (subsystem_id);


--
-- TOC entry 3396 (class 1259 OID 22252)
-- Name: IX_ticket_system_id; Type: INDEX; Schema: public; Owner: postgrespg_dump: creating INDEX "public.IX_user_created_by_id"
pg_dump: creating INDEX "public.IX_user_email"
pg_dump: creating INDEX "public.IX_user_last_updated_by_id"
pg_dump: creating INDEX "public.IX_user_military_rank_id"
pg_dump: creating FK CONSTRAINT "public.Attachments FK_Attachments_ticket_TicketId"

--

CREATE INDEX "IX_ticket_system_id" ON public.ticket USING btree (system_id);


--
-- TOC entry 3371 (class 1259 OID 22258)
-- Name: IX_user_created_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_user_created_by_id" ON public."user" USING btree (created_by_id);


--
-- TOC entry 3372 (class 1259 OID 22259)
-- Name: IX_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_user_email" ON public."user" USING btree (email);


--
-- TOC entry 3373 (class 1259 OID 22260)
-- Name: IX_user_last_updated_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_user_last_updated_by_id" ON public."user" USING btree (last_updated_by_id);


--
-- TOC entry 3374 (class 1259 OID 22261)
-- Name: IX_user_military_rank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_user_military_rank_id" ON public."user" USING btree (military_rank_id);


--
-- TOC entry 3464 (class 2606 OID 22165)
-- Name: Attachments FK_Attachments_ticket_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: postgrespg_dump: creating FK CONSTRAINT "public.Attachments FK_Attachments_user_UploadedById"
pg_dump: creating FK CONSTRAINT "public.CIJobs FK_CIJobs_ticket_TicketId"
pg_dump: creating FK CONSTRAINT "public.Components FK_Components_Subsystems_SubsystemId"

--

ALTER TABLE ONLY public."Attachments"
    ADD CONSTRAINT "FK_Attachments_ticket_TicketId" FOREIGN KEY ("TicketId") REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3465 (class 2606 OID 22170)
-- Name: Attachments FK_Attachments_user_UploadedById; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attachments"
    ADD CONSTRAINT "FK_Attachments_user_UploadedById" FOREIGN KEY ("UploadedById") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3466 (class 2606 OID 22183)
-- Name: CIJobs FK_CIJobs_ticket_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CIJobs"
    ADD CONSTRAINT "FK_CIJobs_ticket_TicketId" FOREIGN KEY ("TicketId") REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3454 (class 2606 OID 22109)
-- Name: Components FK_Components_Subsystems_SubsystemId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Components"
    ADD CONSTRAINT "FK_Components_Subsystems_SubsystemId" FOREIGN KEY ("SubsystemId") REFERENCES public."Subsystems"("Id");


pg_dump: creating FK CONSTRAINT "public.NotificationActions FK_NotificationActions_Notifications_NotificationId"
pg_dump: creating FK CONSTRAINT "public.NotificationActions FK_NotificationActions_user_UserId"
pg_dump: creating FK CONSTRAINT "public.NotificationReads FK_NotificationReads_Notifications_NotificationId"
--
-- TOC entry 3480 (class 2606 OID 22341)
-- Name: NotificationActions FK_NotificationActions_Notifications_NotificationId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationActions"
    ADD CONSTRAINT "FK_NotificationActions_Notifications_NotificationId" FOREIGN KEY ("NotificationId") REFERENCES public."Notifications"(id) ON DELETE CASCADE;


--
-- TOC entry 3481 (class 2606 OID 22346)
-- Name: NotificationActions FK_NotificationActions_user_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationActions"
    ADD CONSTRAINT "FK_NotificationActions_user_UserId" FOREIGN KEY ("UserId") REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3482 (class 2606 OID 22359)
-- Name: NotificationReads FK_NotificationReads_Notifications_NotificationId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationReads"
    ADD CONSTRAINT "FK_NotificationReads_Notifications_NotificationId" FOREIGN KEY ("NotificationId") REFERENCES public."Notifications"(id) ON DELETE CASCADE;


pg_dump: creating FK CONSTRAINT "public.NotificationReads FK_NotificationReads_user_UserId"
pg_dump: creating FK CONSTRAINT "public.Notifications FK_Notifications_ticket_ticket_id"
pg_dump: creating FK CONSTRAINT "public.Notifications FK_Notifications_user_created_by_user_id"
pg_dump: creating FK CONSTRAINT "public.Notifications FK_Notifications_user_resolved_by_user_id"
--
-- TOC entry 3483 (class 2606 OID 22364)
-- Name: NotificationReads FK_NotificationReads_user_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationReads"
    ADD CONSTRAINT "FK_NotificationReads_user_UserId" FOREIGN KEY ("UserId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3476 (class 2606 OID 22313)
-- Name: Notifications FK_Notifications_ticket_ticket_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_ticket_ticket_id" FOREIGN KEY (ticket_id) REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3477 (class 2606 OID 22318)
-- Name: Notifications FK_Notifications_user_created_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_user_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3478 (class 2606 OID 22323)
pg_dump: creating FK CONSTRAINT "public.Notifications FK_Notifications_user_target_user_id"
pg_dump: creating FK CONSTRAINT "public.ProgressRequests FK_ProgressRequests_Notifications_notification_id"
-- Name: Notifications FK_Notifications_user_resolved_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_user_resolved_by_user_id" FOREIGN KEY (resolved_by_user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3479 (class 2606 OID 22328)
-- Name: Notifications FK_Notifications_user_target_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_user_target_user_id" FOREIGN KEY (target_user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3484 (class 2606 OID 22387)
-- Name: ProgressRequests FK_ProgressRequests_Notifications_notification_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "FK_ProgressRequests_Notifications_notification_id" FOREIGN KEY (notification_id) REFERENCES public."Notifications"(id) ON DELETE SET NULL;


pg_dump: creating FK CONSTRAINT "public.ProgressRequests FK_ProgressRequests_TicketActions_response_action_id"
pg_dump: creating FK CONSTRAINT "public.ProgressRequests FK_ProgressRequests_ticket_ticket_id"
pg_dump: creating FK CONSTRAINT "public.ProgressRequests FK_ProgressRequests_user_requested_by_user_id"
--
-- TOC entry 3485 (class 2606 OID 22392)
-- Name: ProgressRequests FK_ProgressRequests_TicketActions_response_action_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "FK_ProgressRequests_TicketActions_response_action_id" FOREIGN KEY (response_action_id) REFERENCES public."TicketActions"("Id") ON DELETE SET NULL;


--
-- TOC entry 3486 (class 2606 OID 22397)
-- Name: ProgressRequests FK_ProgressRequests_ticket_ticket_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "FK_ProgressRequests_ticket_ticket_id" FOREIGN KEY (ticket_id) REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3487 (class 2606 OID 22402)
-- Name: ProgressRequests FK_ProgressRequests_user_requested_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "FK_ProgressRequests_user_requested_by_user_id" FOREIGN KEY (requested_by_user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


pg_dump: creating FK CONSTRAINT "public.ProgressRequests FK_ProgressRequests_user_responded_by_user_id"
pg_dump: creating FK CONSTRAINT "public.ProgressRequests FK_ProgressRequests_user_target_user_id"
pg_dump: creating FK CONSTRAINT "public.Subsystems FK_Subsystems_Systems_SystemId"
--
-- TOC entry 3488 (class 2606 OID 22407)
-- Name: ProgressRequests FK_ProgressRequests_user_responded_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "FK_ProgressRequests_user_responded_by_user_id" FOREIGN KEY (responded_by_user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3489 (class 2606 OID 22412)
-- Name: ProgressRequests FK_ProgressRequests_user_target_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProgressRequests"
    ADD CONSTRAINT "FK_ProgressRequests_user_target_user_id" FOREIGN KEY (target_user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3451 (class 2606 OID 22080)
-- Name: Subsystems FK_Subsystems_Systems_SystemId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subsystems"
    ADD CONSTRAINT "FK_Subsystems_Systems_SystemId" FOREIGN KEY ("SystemId") REFERENCES public."Systems"("Id");


pg_dump: creating FK CONSTRAINT "public.TicketActions FK_TicketActions_ticket_TicketId"
pg_dump: creating FK CONSTRAINT "public.TicketActions FK_TicketActions_user_PerformedById"
pg_dump: creating FK CONSTRAINT "public.TicketComments FK_TicketComments_ticket_TicketId"
pg_dump: creating FK CONSTRAINT "public.TicketComments FK_TicketComments_user_CreatedById"
--
-- TOC entry 3469 (class 2606 OID 22211)
-- Name: TicketActions FK_TicketActions_ticket_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TicketActions"
    ADD CONSTRAINT "FK_TicketActions_ticket_TicketId" FOREIGN KEY ("TicketId") REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3470 (class 2606 OID 22216)
-- Name: TicketActions FK_TicketActions_user_PerformedById; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TicketActions"
    ADD CONSTRAINT "FK_TicketActions_user_PerformedById" FOREIGN KEY ("PerformedById") REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3471 (class 2606 OID 22229)
-- Name: TicketComments FK_TicketComments_ticket_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TicketComments"
    ADD CONSTRAINT "FK_TicketComments_ticket_TicketId" FOREIGN KEY ("TicketId") REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3472 (class 2606 OID 22234)
pg_dump: creating FK CONSTRAINT "public.UserPermissions FK_UserPermissions_user_GrantedById"
pg_dump: creating FK CONSTRAINT "public.UserPermissions FK_UserPermissions_user_UserId"
pg_dump: creating FK CONSTRAINT "public.configuration FK_configuration_user_updated_by_id"
-- Name: TicketComments FK_TicketComments_user_CreatedById; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TicketComments"
    ADD CONSTRAINT "FK_TicketComments_user_CreatedById" FOREIGN KEY ("CreatedById") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3452 (class 2606 OID 22091)
-- Name: UserPermissions FK_UserPermissions_user_GrantedById; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPermissions"
    ADD CONSTRAINT "FK_UserPermissions_user_GrantedById" FOREIGN KEY ("GrantedById") REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3453 (class 2606 OID 22096)
-- Name: UserPermissions FK_UserPermissions_user_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPermissions"
    ADD CONSTRAINT "FK_UserPermissions_user_UserId" FOREIGN KEY ("UserId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3475 (class 2606 OID 22299)
-- Name: configuration FK_configuration_user_updated_by_id; Type: FK CONSTRAINT; Schema: public; Owner: postgrespg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_Components_component_id"
pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_ConfigurationItems_ci_id"
pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_Subsystems_subsystem_id"

--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT "FK_configuration_user_updated_by_id" FOREIGN KEY (updated_by_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 3455 (class 2606 OID 22122)
-- Name: ticket FK_ticket_Components_component_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_Components_component_id" FOREIGN KEY (component_id) REFERENCES public."Components"("Id") ON DELETE RESTRICT;


--
-- TOC entry 3456 (class 2606 OID 22127)
-- Name: ticket FK_ticket_ConfigurationItems_ci_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_ConfigurationItems_ci_id" FOREIGN KEY (ci_id) REFERENCES public."ConfigurationItems"("Id") ON DELETE RESTRICT;


--
-- TOC entry 3457 (class 2606 OID 22132)
-- Name: ticket FK_ticket_Subsystems_subsystem_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_Subsystems_subsystem_id" FOREIGN KEY (subsystem_id) REFERENCES public."Subsystems"("Id") ON DELETE RESTRICT;


pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_Systems_system_id"
pg_dump: creating FK CONSTRAINT "public.ticket_response_personnel FK_ticket_response_personnel_ticket_ticket_id"
pg_dump: creating FK CONSTRAINT "public.ticket_response_personnel FK_ticket_response_personnel_user_user_id"
--
-- TOC entry 3458 (class 2606 OID 22137)
-- Name: ticket FK_ticket_Systems_system_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_Systems_system_id" FOREIGN KEY (system_id) REFERENCES public."Systems"("Id") ON DELETE RESTRICT;


--
-- TOC entry 3467 (class 2606 OID 22193)
-- Name: ticket_response_personnel FK_ticket_response_personnel_ticket_ticket_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_response_personnel
    ADD CONSTRAINT "FK_ticket_response_personnel_ticket_ticket_id" FOREIGN KEY (ticket_id) REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3468 (class 2606 OID 22198)
-- Name: ticket_response_personnel FK_ticket_response_personnel_user_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_response_personnel
    ADD CONSTRAINT "FK_ticket_response_personnel_user_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


pg_dump: creating FK CONSTRAINT "public.ticket_response_resolved_personnel FK_ticket_response_resolved_personnel_ticket_ticket_id"
pg_dump: creating FK CONSTRAINT "public.ticket_response_resolved_personnel FK_ticket_response_resolved_personnel_user_user_id"
pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_user_activity_control_commander_id"
--
-- TOC entry 3473 (class 2606 OID 22281)
-- Name: ticket_response_resolved_personnel FK_ticket_response_resolved_personnel_ticket_ticket_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_response_resolved_personnel
    ADD CONSTRAINT "FK_ticket_response_resolved_personnel_ticket_ticket_id" FOREIGN KEY (ticket_id) REFERENCES public.ticket(id) ON DELETE CASCADE;


--
-- TOC entry 3474 (class 2606 OID 22286)
-- Name: ticket_response_resolved_personnel FK_ticket_response_resolved_personnel_user_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_response_resolved_personnel
    ADD CONSTRAINT "FK_ticket_response_resolved_personnel_user_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3459 (class 2606 OID 22266)
-- Name: ticket FK_ticket_user_activity_control_commander_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_user_activity_control_commander_id" FOREIGN KEY (activity_control_commander_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_user_activity_control_personnel_id"
pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_user_created_by_id"
pg_dump: creating FK CONSTRAINT "public.ticket FK_ticket_user_last_updated_by_id"
pg_dump: creating FK CONSTRAINT "public.user FK_user_MilitaryRanks_military_rank_id"
--
-- TOC entry 3460 (class 2606 OID 22271)
-- Name: ticket FK_ticket_user_activity_control_personnel_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_user_activity_control_personnel_id" FOREIGN KEY (activity_control_personnel_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3461 (class 2606 OID 22142)
-- Name: ticket FK_ticket_user_created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_user_created_by_id" FOREIGN KEY (created_by_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3462 (class 2606 OID 22147)
-- Name: ticket FK_ticket_user_last_updated_by_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "FK_ticket_user_last_updated_by_id" FOREIGN KEY (last_updated_by_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3448 (class 2606 OID 22057)
pg_dump: creating FK CONSTRAINT "public.user FK_user_user_created_by_id"
pg_dump: creating FK CONSTRAINT "public.user FK_user_user_last_updated_by_id"
pg_dump: creating FK CONSTRAINT "public.ticket fk_ticket_detection_detected_by_user"
-- Name: user FK_user_MilitaryRanks_military_rank_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_user_MilitaryRanks_military_rank_id" FOREIGN KEY (military_rank_id) REFERENCES public."MilitaryRanks"("Id") ON DELETE SET NULL;


--
-- TOC entry 3449 (class 2606 OID 22062)
-- Name: user FK_user_user_created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_user_user_created_by_id" FOREIGN KEY (created_by_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3450 (class 2606 OID 22067)
-- Name: user FK_user_user_last_updated_by_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_user_user_last_updated_by_id" FOREIGN KEY (last_updated_by_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 3463 (class 2606 OID 22152)
-- Name: ticket fk_ticket_detection_detected_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT fk_ticket_detection_detected_by_user FOREIGN KEY (detected_by_user_id) REFERENCES public."user"(id) ON DELETE SET NULL;


-- Completed on 2025-11-26 03:50:01 +03

--
-- PostgreSQL database dump complete
--

\unrestrict 0wIaBEUjs2FXMevTbUYEcDC19SO3BQEAa4HQrFB2fE3aB0pDLOb5ehHCHXmLFRp

