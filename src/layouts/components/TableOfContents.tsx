import React from "react";
import { useEffect, useState } from 'react';
import './TableOfContents.css';
import type { TocItem } from '@/util/generateToc';


interface Props {
	toc: TocItem[];
}

export function TableOfContents({ toc = [] }: Props) {
	const [currentHeading, setCurrentHeading] = useState({
		slug: toc[0].slug,
		text: toc[0].text,
	});
    const onThisPageID = 'on-this-page-heading';

	useEffect(() => {
		const setCurrent: IntersectionObserverCallback = (entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const { id } = entry.target;
					if (id === onThisPageID) continue;
					setCurrentHeading({
						slug: entry.target.id,
						text: entry.target.textContent || '',
					});
					break;
				}
			}
		};

		const observerOptions: IntersectionObserverInit = {
			// Negative top margin accounts for `scroll-margin`.
			// Negative bottom margin means heading needs to be towards top of viewport to trigger intersection.
			rootMargin: '-100px 0% -66%',
			threshold: 1,
		};

		const headingsObserver = new IntersectionObserver(setCurrent, observerOptions);

		// Observe all the headings in the main page content.
		document.querySelectorAll('article :is(h1,h2,h3)').forEach((h) => headingsObserver.observe(h));

		// Stop observing when the component is unmounted.
		return () => headingsObserver.disconnect();
	}, []);

	const TableOfContentsItem = ({ heading }: { heading: TocItem }) => {
		const { depth, slug, text, children } = heading;
		return (
			<li>
				<a
					className={`header-link depth-${depth} ${
						currentHeading.slug === slug ? 'current-header-link' : ''
					}`.trim()}
					href={`#${slug}`}
				>
					{text}
				</a>
				{children.length > 0 ? (
					<ul>
						{children.map((heading) => (
							<TableOfContentsItem key={heading.slug} heading={heading} />
						))}
					</ul>
				) : null}
			</li>
		);
	};

	return (
		<>	
			<h2 className="heading" id={onThisPageID}>
				On this page
			</h2>
			<ul className="toc-root">
				{toc.map((heading2) => (
					<TableOfContentsItem key={heading2.slug} heading={heading2} />
				))}
			</ul>
		</>
				
	);
};

