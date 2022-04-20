--
-- PostgreSQL database dump
--

-- Dumped from database version 10.12 (Ubuntu 10.12-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.12 (Ubuntu 10.12-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: CountryCodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CountryCodes" (
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public."CountryCodes" OWNER TO postgres;

--
-- Name: CpBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CpBalance" (
    id character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    amount numeric(40,20) DEFAULT 0 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."CpBalance" OWNER TO postgres;

--
-- Name: CpTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CpTransactions" (
    id character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "txId" character varying(255),
    currency1 character varying(255),
    currency2 character varying(255),
    type character varying(255),
    address character varying(255),
    "buyerEmail" character varying(255) NOT NULL,
    "currency1Amount" numeric(40,20) NOT NULL,
    "currency2Amount" numeric(40,20) NOT NULL,
    fee numeric(40,20) DEFAULT 0 NOT NULL,
    status character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    options jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."CpTransactions" OWNER TO postgres;

--
-- Name: Currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Currencies" (
    id character varying(255) NOT NULL,
    symbol character varying(255),
    "fullTitle" character varying(255),
    decimals integer,
    "currentRate" character varying(255),
    "txLimits" jsonb DEFAULT '{}'::jsonb,
    fiat boolean DEFAULT false,
    "parentId" character varying(255),
    meta jsonb DEFAULT '{}'::jsonb,
    change character varying(255) DEFAULT NULL::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Currencies" OWNER TO postgres;

--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id character varying(255) NOT NULL,
    "userId" character varying(255),
    seen boolean DEFAULT false,
    type integer,
    meta jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: RatesHistories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RatesHistories" (
    id character varying(255) NOT NULL,
    "currencyId" character varying(255),
    rate character varying(255),
    volume character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."RatesHistories" OWNER TO postgres;

--
-- Name: Referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Referrals" (
    id character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" character varying(255) NOT NULL,
    "refId" character varying(255) NOT NULL
);


ALTER TABLE public."Referrals" OWNER TO postgres;

--
-- Name: Rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rewards" (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    amount character varying(255) DEFAULT '0'::character varying NOT NULL,
    "currencyId" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Rewards" OWNER TO postgres;

-- Name: Sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sessions" (
    id character varying(255) NOT NULL,
    "userId" character varying(255),
    "lastUsedDate" timestamp with time zone,
    "lastUsedIp" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Sessions" OWNER TO postgres;

--
-- Name: Transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transactions" (
    id character varying(255) NOT NULL,
    status integer DEFAULT 0,
    amount bigint,
    type integer,
    "to" character varying(255),
    description character varying(255),
    meta jsonb DEFAULT '{}'::jsonb,
    "currencyId" character varying(255),
    "walletId" character varying(255),
    "userId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Transactions" OWNER TO postgres;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id character varying(255) NOT NULL,
    email character varying(255),
    password character varying(255),
    avatar text,
    "firstName" character varying(255),
    "lastName" character varying(255),
    phone character varying(255),
    nickname character varying(255),
    settings jsonb DEFAULT '{}'::jsonb,
    status integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    memo character varying(255),
    "refLink" character varying(255),
    "verificationStatus" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallets" (
    id character varying(255) NOT NULL,
    balance character varying(255),
    "userId" character varying(255),
    "currencyId" character varying(255),
    settings jsonb DEFAULT '{}'::jsonb,
    address character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Wallets" OWNER TO postgres;

--
-- Name: vFieldsInfo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."vFieldsInfo" (
    id character varying(255) NOT NULL,
    "vServiceId" character varying(255) NOT NULL,
    "countryCode" character varying(255) NOT NULL,
    "fieldsInfo" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "rawFieldsInfo" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "requiredFields" jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public."vFieldsInfo" OWNER TO postgres;

--
-- Name: vServices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."vServices" (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "allowCountries" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."vServices" OWNER TO postgres;

--
-- Name: CountryCodes CountryCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CountryCodes"
    ADD CONSTRAINT "CountryCodes_pkey" PRIMARY KEY (code);


--
-- Name: CpBalance CpBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CpBalance"
    ADD CONSTRAINT "CpBalance_pkey" PRIMARY KEY (id);


--
-- Name: CpTransactions CpTransactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CpTransactions"
    ADD CONSTRAINT "CpTransactions_pkey" PRIMARY KEY (id);


--
-- Name: Currencies Currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: RatesHistories RatesHistories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RatesHistories"
    ADD CONSTRAINT "RatesHistories_pkey" PRIMARY KEY (id);


--
-- Name: Referrals Referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT "Referrals_pkey" PRIMARY KEY (id);


--
-- Name: Rewards Rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rewards"
    ADD CONSTRAINT "Rewards_pkey" PRIMARY KEY (id);

--
-- Name: Sessions Sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sessions"
    ADD CONSTRAINT "Sessions_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_memo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_memo_key" UNIQUE (memo);


--
-- Name: Users Users_nickname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_nickname_key" UNIQUE (nickname);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_refLink_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_refLink_key" UNIQUE ("refLink");


--
-- Name: Wallets Wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_pkey" PRIMARY KEY (id);


--
-- Name: vFieldsInfo vFieldsInfo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."vFieldsInfo"
    ADD CONSTRAINT "vFieldsInfo_pkey" PRIMARY KEY (id);


--
-- Name: vServices vServices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."vServices"
    ADD CONSTRAINT "vServices_pkey" PRIMARY KEY (id);

--
-- Name: transactions_user_id_wallet_id_currency_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_user_id_wallet_id_currency_id ON public."Transactions" USING btree ("userId", "walletId", "currencyId");


--
-- Name: wallets_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wallets_address ON public."Wallets" USING btree (address);

-- Name: Notifications Notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RatesHistories RatesHistories_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RatesHistories"
    ADD CONSTRAINT "RatesHistories_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Sessions Sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sessions"
    ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Transactions Transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallets Wallets_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currencies"(id) ON UPDATE CASCADE;


--
-- Name: Wallets Wallets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CpBalance cp_balance_userId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CpBalance"
    ADD CONSTRAINT "cp_balance_userId_fk" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: CpTransactions cp_transactions_userId_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CpTransactions"
    ADD CONSTRAINT "cp_transactions_userId_fk" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: vFieldsInfo ref_v_fields_v_service_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."vFieldsInfo"
    ADD CONSTRAINT ref_v_fields_v_service_id_fk FOREIGN KEY ("vServiceId") REFERENCES public."vServices"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referrals referrals_ref_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT referrals_ref_id_fk FOREIGN KEY ("refId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referrals referrals_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT referrals_user_id_fk FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


