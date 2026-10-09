<img src="assets/header.svg" width="100%" alt="Mika de Geus. Owner of MDG Developments since October 2026. Lead Developer at Cobblemon Rejects, Automation Specialist, AD Cybersecurity student at HvA. I build and run systems end to end: server software, web apps, the infrastructure underneath and the automation in between." />

<p>
  <a href="https://www.linkedin.com/in/mika-de-geus-a6238226b/"><img src="https://img.shields.io/badge/LinkedIn-Mika%20de%20Geus-0A66C2?style=for-the-badge" alt="LinkedIn: Mika de Geus" /></a>
  <a href="mailto:mikadegeus@outlook.com"><img src="https://img.shields.io/badge/Email-mikadegeus%40outlook.com-E3350D?style=for-the-badge" alt="Email: mikadegeus@outlook.com" /></a>
  <a href="https://discord.com/users/mikadegeus"><img src="https://img.shields.io/badge/Discord-mikadegeus-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord: mikadegeus" /></a>
</p>

<img src="assets/what-i-do.svg" width="100%" alt="What I do. Game servers and infrastructure: Lead Developer at Cobblemon Rejects, a Minecraft network. A Velocity proxy and 5 Fabric backends, 15 custom server-side mods in Java 21, cross-server sync over Redis, MariaDB and MongoDB, Docker operations with encrypted backups and 2FA, and a Discord bot for the community. Automation Specialist in financial services (lending): bank statement checks, email handling and business credit proposals. Security, AD Cybersecurity at HvA: pentesting, OSINT, risk analysis, network and OT/ICS security. Web: the Studio Lumeza website, built with Astro as client work." />

<img src="assets/cmrejects.svg" width="100%" alt="Featured project: Cobblemon Rejects, a Minecraft network where I am lead developer, covering architecture, mods and operations. A single Velocity proxy routes players to five pure Fabric 1.21.1 backends: hub, peaceful, hard, resource and adventure. Shared state lives in Redis, MariaDB and MongoDB. What I built: the architecture, 15 custom mods in Java 21, the sync layer and the operations with Docker, backups and 2FA. The hard part: a version-guarded Redis handoff, so switching worlds never rolls a player back." />

<details>
<summary><b>Cobblemon Rejects in depth: the handoff, the mods and how it runs</b></summary>

<br/>

**The handoff**

Party, PC, Pokédex, inventory, economy and location follow every player across all five worlds. Switching worlds is where that usually breaks: the target loads the player before the source has finished saving. So the source saves and marks the player ready in Redis, the target waits for that signal before it loads, and every write carries a version so a stale save can never overwrite newer data. The same Redis channel relays one shared chat across all worlds.

**Custom mods (Java 21, Fabric)**

- **Sync:** inventory, XP, health, stats and location over MariaDB, gated by the Redis handoff. Around 1,000 lines with JUnit unit and integration tests.
- **Delivery:** hub-store purchases become pending credits that a player redeems on any survival world.
- **Realms:** proxy-side command that routes a player to any backend by name.
- **Vouchers:** economy vouchers on an unforgeable base item. Payouts are treated as untrusted input and clamped.
- **Shop Limits:** a per-player daily sell cap that closes a buy, craft, sell-high exploit loop.
- **Rank features:** per-rank PC boxes, cooldowns and rank badges, all driven by LuckPerms meta.
- **Plus:** a server-side homes menu, a permission-filtered help index, legendary spawn tracking, arena border handling, Reject-form enforcement and quality-of-life commands.

**Operations**

- Docker Compose runs the five backends, the proxy and three datastores as one reproducible stack on a dedicated server.
- Caddy with Authelia TOTP forward-auth in front of every admin panel.
- Nightly encrypted snapshots with an off-site copy, and a restore drill tested end to end.
- World pregeneration, external uptime monitoring and a Discord bot for the community.

</details>

<img src="assets/toolbox.svg" width="100%" alt="Toolbox. Languages: Java, TypeScript, JavaScript, Python, SQL, Bash. Game servers: Fabric, Velocity, Paper, Gradle, JUnit 5, LuckPerms. Web: Astro, React, Next.js, Express, Vite, Tailwind CSS, Prisma, Firebase. Data and infra: Redis, MariaDB, MongoDB, Docker, Linux, Caddy, Nginx, Cloudflare. Automation: n8n, Puppeteer, Python scripting. Security: Burp Suite, nmap, Wireshark, Scapy, Authelia, OWASP, ISO 27001, MITRE ATT&CK." />
