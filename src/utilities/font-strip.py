#!/usr/bin/env python3

import os
import argparse
import logging

from fontTools.ttLib import TTFont

def main(args=None):
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("-f", "--file", required=True)
    parser.add_argument("-v", "--verbose", action="count", default=0)

    options = parser.parse_args(args)

    if not options.verbose:
        level = "WARNING"
    elif options.verbose == 1:
        level = "INFO"
    else:
        level = "DEBUG"

    logging.basicConfig(level=level, format="%(message)s")
    logger = logging.getLogger()

    if not os.path.isfile(options.file):
        parser.error("No such file")

    font = TTFont(options.file, recalcTimestamp=False)

    revision = '1.0'

    head = font.get('head')
    os2 = font.get('OS/2')
    name = font.get('name')

    head.fontRevision = float(revision)
    os2.achVendID = " "

    for platform in ((1, 0, 0), (3, 1, 0x409)): # (Mac, Roman, English), (Windows, Unicode BMP, English US)
      name.setName('', 0, *platform) # copyright
      name.setName('', 13, *platform) # license
      name.setName('Version ' + revision, 5, *platform)

    font.save(options.file)
    logger.info("Saved font: '%s'", options.file)

    font.close()
    del font

    logger.info("Done!")

if __name__ == "__main__":
    main()
