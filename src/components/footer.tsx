export default function FooterSection() {
	return (
		<div className="w-full pt-10 flex flex-col justify-start items-start">
			{/* Main Footer Content */}
			<div className="self-stretch h-auto flex flex-col md:flex-row justify-between items-stretch pr-0 pb-8 pt-0">
				<div className="h-auto p-4 md:p-8 flex flex-col justify-center items-center gap-8 w-full ">
					{/* Brand Section */}
					<div className="self-stretch flex justify-center items-center gap-3">
						<div className="flex justify-center items-center">
							<svg
								viewBox="0 0 473 473"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-accent-foreground"
								style={{
									width: "1em",
									height: "1em",
									display: "inline-block",
								}}
							>
								<title>Logo</title>
								<g clipPath="url(#clip0_38_23)">
									<path
										d="M226.646 413.875H98.5417C88.0877 413.875 78.0619 409.722 70.6699 402.33C63.2778 394.938 59.125 384.912 59.125 374.458V98.5417C59.125 88.0877 63.2778 78.0619 70.6699 70.6699C78.0619 63.2778 88.0877 59.125 98.5417 59.125H374.458C384.912 59.125 394.938 63.2778 402.33 70.6699C409.722 78.0619 413.875 88.0877 413.875 98.5417V216.792"
										stroke="currentColor"
										strokeWidth="10"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M59.125 197.083H413.875"
										stroke="currentColor"
										strokeWidth="10"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M197.083 59.125V413.875"
										stroke="currentColor"
										strokeWidth="10"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<g clipPath="url(#clip1_38_23)">
										<path
											d="M397.438 318.5L321.5 394.438"
											stroke="currentColor"
											strokeWidth="20"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M382.25 234.969L237.969 379.25"
											stroke="currentColor"
											strokeWidth="20"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</g>
								</g>
								<defs>
									<clipPath id="clip0_38_23">
										<rect width="473" height="473" fill="white" />
									</clipPath>
									<clipPath id="clip1_38_23">
										<rect
											width="243"
											height="243"
											fill="white"
											transform="translate(200 197)"
										/>
									</clipPath>
								</defs>
							</svg>
							<h1 className="flex font-bold">TANCN</h1>
						</div>
					</div>
					<div>Build production-ready forms and tables with a easy</div>

					{/* Social Media Icons */}
					<div className="flex justify-start items-start gap-4">
						{/* Twitter/X Icon */}
						<div className="w-6 h-6 relative overflow-hidden">
							<div className="w-6 h-6 left-0 top-0 absolute flex items-center justify-center">
								<a
									href="https://x.com/vijayabaskar56"
									target="_blank"
									rel="noopener noreferrer"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-label="Twitter"
									>
										<title>Twitter</title>
										<path
											d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
											fill="currentColor"
										/>
									</svg>
								</a>
							</div>
						</div>

						{/* LinkedIn Icon */}
						<div className="w-6 h-6 relative overflow-hidden">
							<div className="w-6 h-6 left-0 top-0 absolute flex items-center justify-center">
								<a
									href="https://www.linkedin.com/in/vijaya-baskar/"
									rel="noopener noreferrer"
									target="_blank"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-label="LinkedIn"
									>
										<title>LinkedIn</title>
										<path
											d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"
											fill="currentColor"
										/>
									</svg>
								</a>
							</div>
						</div>

						{/* GitHub Icon */}
						<div className="w-6 h-6 relative overflow-hidden">
							<div className="w-6 h-6 left-0 top-0 absolute flex items-center justify-center">
								<a
									href="https://github.com/Vijayabaskar56/tancn"
									target="_blank"
									rel="noopener noreferrer"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-label="GitHub"
									>
										<title>GitHub</title>
										<path
											d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.374-12-12-12z"
											fill="currentColor"
										/>
									</svg>
								</a>
							</div>
						</div>

						{/* Email Icon */}
						<div className="w-6 h-6 relative overflow-hidden">
							<div className="w-6 h-6 left-0 top-0 absolute flex items-center justify-center">
								<a href="mailto:vj2k02@gmail.com" aria-label="Email">
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>Email</title>
										<path
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Section with Pattern */}
			<div className="self-stretch h-12 relative overflow-hidden border-t border-b border-border">
				<div className="absolute inset-0 w-full h-full overflow-hidden">
					<div className="w-full h-full text-center mt-2 relative">
						{Array.from({ length: 400 }).map((_, i) => (
							<div
								key={i}
								className="absolute w-[300px] h-16 border border-border"
								style={{
									left: `${i * 300 - 600}px`,
									top: "-120px",
									transform: "rotate(-45deg)",
									transformOrigin: "top left",
								}}
							/>
						))}
						© 2025 Better-T-Stack. All rights reserved.
					</div>
				</div>
			</div>
		</div>
	);
}
